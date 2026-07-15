const { Router } = require('express');
const firebird = require('../db/firebird');

const router = Router();

router.get('/', (request, response) => {
  response.json({
    status: 'ok',
    databases: firebird.configuredDatabaseNames()
  });
});

module.exports = router;
