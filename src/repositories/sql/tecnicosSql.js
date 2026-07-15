module.exports = {
  list: `
    select
      pp.parceiro as id_vendedor,
      trim(pp.nome) as nome
    from parceiros pp
    where pp.idn_tecnico = 'S'
    order by pp.nome
  `
};
