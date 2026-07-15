const firebird = require('../db/firebird');
const ordensServicoSql = require('./sql/ordensServicoSql');

const osRequiredFields = [
  'id_cliente',
  'id_operador',
  'data_abertura',
  'hora_abertura'
];

const servicoRequiredFields = [
  'tecnico',
  'qtd_horas_proposta',
  'total_proposta',
  'id_servico'
];

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function requireFields(payload, fields, messagePrefix) {
  const missingFields = fields.filter((field) => !hasValue(payload[field]));

  if (missingFields.length) {
    throw validationError(`${messagePrefix}: ${missingFields.join(', ')}.`);
  }
}

function nullable(value) {
  return value === undefined || value === '' ? null : value;
}

function pickFirstValue(payload, fields) {
  for (const field of fields) {
    if (hasValue(payload[field])) {
      return payload[field];
    }
  }

  return undefined;
}

function normalizeServicoPayload(payload, index) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw validationError(`Servico ${index + 1} invalido.`);
  }

  const servico = {
    tecnico: pickFirstValue(payload, ['tecnico', 'id_tecnico']),
    qtd_horas_proposta: pickFirstValue(payload, ['qtd_horas_proposta', 'qtd', 'quantidade']),
    total_proposta: pickFirstValue(payload, ['total_proposta', 'valor', 'total']),
    id_servico: pickFirstValue(payload, ['id_servico', 'servico'])
  };

  requireFields(servico, servicoRequiredFields, `Campos obrigatorios ausentes no servico ${index + 1}`);

  return servico;
}

function normalizeServicos(body) {
  const servicosPayload = body.servicos !== undefined ? body.servicos : body.servicos_alocados;

  if (servicosPayload === undefined) {
    return [normalizeServicoPayload(body, 0)];
  }

  if (!Array.isArray(servicosPayload) || servicosPayload.length === 0) {
    throw validationError('Informe ao menos um servico para a O.S.');
  }

  return servicosPayload.map((servico, index) => normalizeServicoPayload(servico, index));
}

function firstReturnedValue(rows, preferredFields) {
  const row = Array.isArray(rows) ? rows[0] : rows;

  if (!row || typeof row !== 'object') {
    return row;
  }

  if (Array.isArray(row)) {
    return row[0];
  }

  for (const field of preferredFields) {
    if (Object.prototype.hasOwnProperty.call(row, field)) {
      return row[field];
    }
  }

  const normalizedField = Object.keys(row).find((key) =>
    preferredFields.some((field) => key.toLowerCase() === field.toLowerCase())
  );

  if (normalizedField) {
    return row[normalizedField];
  }

  const values = Object.values(row);
  return values.length === 1 ? values[0] : undefined;
}

function parseOsNumber(value) {
  const os = Number(value);

  if (!Number.isSafeInteger(os) || os < 0) {
    const error = new Error('Numero da O.S. retornado pelo banco e invalido.');
    error.statusCode = 500;
    throw error;
  }

  return os;
}

function calculateUnitPrice(total, quantity, index) {
  const parsedTotal = Number(total);
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedTotal) || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    throw validationError(`Valores invalidos para calcular o unitario do servico ${index + 1} da O.S.`);
  }

  return parsedTotal / parsedQuantity;
}

async function create(databaseName, body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw validationError('Payload da O.S. invalido.');
  }

  requireFields(body, osRequiredFields, 'Campos obrigatorios ausentes na O.S.');
  const servicos = normalizeServicos(body);

  return firebird.runInTransaction(databaseName, async (transaction) => {
    const rows = await transaction.query(ordensServicoSql.createOs, [
      body.id_cliente,
      body.id_operador,
      nullable(body.id_veiculo),
      nullable(body.os_fabrica),
      nullable(body.solicitante),
      body.data_abertura,
      body.hora_abertura,
      body.data_abertura,
      body.hora_abertura,
      nullable(body.obs_os)
    ]);
    const os = parseOsNumber(firstReturnedValue(rows, ['os']));

    for (const [index, servico] of servicos.entries()) {
      const unitario = calculateUnitPrice(servico.total_proposta, servico.qtd_horas_proposta, index);

      await transaction.execute(ordensServicoSql.createServicoAlocado, [
        os,
        index + 1,
        servico.tecnico,
        body.data_abertura,
        servico.qtd_horas_proposta,
        servico.total_proposta,
        unitario,
        servico.id_servico
      ]);
    }

    await transaction.execute(ordensServicoSql.updateGeneratorOs(os));

    return { os, servicos: servicos.length };
  });
}

async function nextNumber(databaseName) {
  const rows = await firebird.query(databaseName, ordensServicoSql.nextOsNumber);

  return {
    os: parseOsNumber(firstReturnedValue(rows, ['os']))
  };
}

module.exports = {
  create,
  nextNumber
};

