const baseSelect = `
  select
    po.obra as id,
    trim(po.descricao) as descricao,
    trim(po.obs) as observacoes,
    po.valor_aquisicao
  from parceiros_obras po
`;

const whereAtivos = 'where po.departamento is not null';

module.exports = {
  findById: `${baseSelect} ${whereAtivos} and po.obra = ?`,
  list: `${baseSelect} ${whereAtivos} order by po.descricao`
};
