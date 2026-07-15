const { Router } = require('express');
const asyncHandler = require('../http/asyncHandler');
const tecnicosRepository = require('../repositories/tecnicosRepository');

const router = Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const rows = await tecnicosRepository.list(request.params.database);
    response.json(rows);
  })
);

module.exports = router;
