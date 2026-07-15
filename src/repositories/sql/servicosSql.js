module.exports = {
  list: `
    select
      s.servico as id_servicos,
      trim(s.descricao) as descricao
    from os_servicos s
    order by s.descricao
  `
};
