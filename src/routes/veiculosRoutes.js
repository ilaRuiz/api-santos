const { Router } = require('express');
const asyncHandler = require('../http/asyncHandler');
const { notFound } = require('../http/errors');
const veiculosRepository = require('../repositories/veiculosRepository');

const router = Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const rows = await veiculosRepository.list(request.params.database);
    response.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (request, response) => {
    const row = await veiculosRepository.findById(request.params.database, request.params.id);

    if (!row) {
      throw notFound('Veículo não encontrado.');
    }

    response.json(row);
  })
);

router.post(
  '/',
  asyncHandler(async (request, response) => {
    const row = await veiculosRepository.create(request.params.database, request.body);
    response.status(201).json(row);
  })
);

router.put(
  '/:id',
  asyncHandler(async (request, response) => {
    const row = await veiculosRepository.update(
      request.params.database,
      request.params.id,
      request.body
    );

    if (!row) {
      throw notFound('Veículo não encontrado para atualização.');
    }

    response.json(row);
  })
);

module.exports = router;
