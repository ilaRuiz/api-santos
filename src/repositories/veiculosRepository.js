const firebird = require('../db/firebird');
const {
  allowedValues,
  buildInsert,
  buildUpdate,
  normalizePayload
} = require('./sqlBuilders');
const veiculosSql = require('./sql/veiculosSql');

const fieldAliases = {
  id: 'obra',
  observacoes: 'obs'
};

const writableFields = {
  obra: 'obra',
  descricao: 'descricao',
  obs: 'obs',
  valor_aquisicao: 'valor_aquisicao'
};

async function list(databaseName) {
  return firebird.query(databaseName, veiculosSql.list);
}

async function findById(databaseName, id) {
  const rows = await firebird.query(
    databaseName,
    veiculosSql.findById,
    [id]
  );

  return rows[0] || null;
}

async function create(databaseName, body) {
  const payload = normalizePayload(body, fieldAliases);
  const values = allowedValues(payload, writableFields);
  const statement = buildInsert('parceiros_obras', values, 'obra');
  const rows = await firebird.query(databaseName, statement.sql, statement.params);
  const id = rows[0]?.obra || values.obra;

  return findById(databaseName, id);
}

async function update(databaseName, id, body) {
  const payload = normalizePayload(body, fieldAliases);
  delete payload.obra;

  const values = allowedValues(payload, writableFields);
  const statement = buildUpdate('parceiros_obras', 'obra', id, values);

  await firebird.execute(databaseName, statement.sql, statement.params);
  return findById(databaseName, id);
}

module.exports = {
  create,
  findById,
  list,
  update
};
