const { Router } = require('express');
const asyncHandler = require('../http/asyncHandler');
const operadoresRepository = require('../repositories/operadoresRepository');

const router = Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const rows = await operadoresRepository.list(request.params.database);
    response.json(rows);
  })
);

module.exports = router;
