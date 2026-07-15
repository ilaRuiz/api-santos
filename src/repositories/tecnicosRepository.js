const firebird = require('../db/firebird');
const tecnicosSql = require('./sql/tecnicosSql');

async function list(databaseName) {
  return firebird.query(databaseName, tecnicosSql.list);
}

module.exports = {
  list
};
