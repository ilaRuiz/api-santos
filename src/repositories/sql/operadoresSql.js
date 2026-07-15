module.exports = {
  list: `
    select
      op.operador,
      trim(op.nome) as nome
    from operadores op
    where op.data_baixa is null
    order by op.nome
  `
};
