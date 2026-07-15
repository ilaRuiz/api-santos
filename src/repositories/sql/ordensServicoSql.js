module.exports = {
  nextOsNumber: `
    select
      GEN_ID(GEN_OS, 1) as os
    from RDB$DATABASE
  `,

  createOs: `
    insert into os (
      os,
      codfilial,
      parceiro,
      operador_abert,
      codoper,
      tabela_preco,
      parceiros_obra,
      os_fabrica,
      contato_nome,
      data_abertura,
      hora_abertura,
      idn_sistema,
      data_entrega,
      hora_entrega,
      idn_entregar,
      cidade_prest_servico,
      obs
    )
    values (
      GEN_ID(GEN_OS, 1),
      1,
      ?,
      ?,
      500,
      1,
      ?,
      ?,
      ?,
      ?,
      ?,
      'MAQUINAS',
      ?,
      ?,
      'N',
      2230,
      ?
    )
    returning os
  `,

  createServicoAlocado: `
    insert into os_servicos_alocados (
      os,
      seq,
      tecnico,
      data_alocacao,
      qtd,
      valor,
      unitario,
      servico
    )
    values (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
    )
  `,

  updateGeneratorOs(os) {
    return `set generator gen_os to ${os}`;
  }
};

