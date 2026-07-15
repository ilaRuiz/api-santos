const { Router } = require('express');
const asyncHandler = require('../http/asyncHandler');
const ordensServicoRepository = require('../repositories/ordensServicoRepository');

const router = Router({ mergeParams: true });

router.get(
  '/proxima',
  asyncHandler(async (request, response) => {
    const row = await ordensServicoRepository.nextNumber(request.params.database);
    response.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (request, response) => {
    const row = await ordensServicoRepository.create(request.params.database, request.body);
    response.status(201).json(row);
  })
);

module.exports = router;
