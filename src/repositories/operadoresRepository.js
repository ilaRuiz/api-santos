const firebird = require('../db/firebird');
const operadoresSql = require('./sql/operadoresSql');

async function list(databaseName) {
  return firebird.query(databaseName, operadoresSql.list);
}

module.exports = {
  list
};
