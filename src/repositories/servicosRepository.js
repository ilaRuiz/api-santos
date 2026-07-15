const firebird = require('../db/firebird');
const servicosSql = require('./sql/servicosSql');

async function list(databaseName) {
  return firebird.query(databaseName, servicosSql.list);
}

module.exports = {
  list
};
