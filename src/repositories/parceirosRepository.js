const firebird = require('../db/firebird');
const {
  allowedValues,
  buildInsert,
  buildUpdate,
  normalizePayload
} = require('./sqlBuilders');
const parceirosSql = require('./sql/parceirosSql');

const fieldAliases = {
  id: 'parceiro',
  id_cliente: 'parceiro',
  nome: 'fantasia'
};

const writableFields = {
  parceiro: 'parceiro',
  fantasia: 'fantasia',
  endereco: 'endereco',
  numero: 'numero',
  municipio: 'municipio',
  uf: 'uf',
  cep: 'cep',
  telefone: 'telefone',
  celular: 'celular',
  cpf: 'cpf',
  cnpj: 'cnpj',
  forma: 'forma',
  codcondrec: 'codcondrec'
};

async function list(databaseName) {
  return firebird.query(databaseName, parceirosSql.list);
}

async function findById(databaseName, id) {
  const rows = await firebird.query(
    databaseName,
    parceirosSql.findById,
    [id]
  );

  return rows[0] || null;
}

async function create(databaseName, body) {
  const payload = normalizePayload(body, fieldAliases);
  const values = allowedValues(payload, writableFields);
  const statement = buildInsert('parceiros', values, 'parceiro');
  const rows = await firebird.query(databaseName, statement.sql, statement.params);
  const id = rows[0]?.parceiro || values.parceiro;

  return findById(databaseName, id);
}

async function update(databaseName, id, body) {
  const payload = normalizePayload(body, fieldAliases);
  delete payload.parceiro;

  const values = allowedValues(payload, writableFields);
  const statement = buildUpdate('parceiros', 'parceiro', id, values);

  await firebird.execute(databaseName, statement.sql, statement.params);
  return findById(databaseName, id);
}

module.exports = {
  create,
  findById,
  list,
  update
};
