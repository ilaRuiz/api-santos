const { Router } = require('express');
const asyncHandler = require('../http/asyncHandler');
const servicosRepository = require('../repositories/servicosRepository');

const router = Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const rows = await servicosRepository.list(request.params.database);
    response.json(rows);
  })
);

module.exports = router;
