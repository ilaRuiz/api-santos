const telefoneSemEspacos =
  "trim(replace(coalesce(nullif(trim(p.telefone), ''), nullif(trim(p.celular), '')), ' ', ''))";

const baseSelect = `
  select
    p.parceiro as id_cliente,
    p.fantasia as nome,
    p.endereco,
    p.numero,
    p.municipio || ' - ' || p.uf as municipio,
    p.cep,
    ${telefoneSemEspacos} as telefone,
    coalesce(p.cpf, p.cnpj) as cpf_cnpj,
    trim(f.dscforma) as dscforma,
    trim(c.dsccondrec) as dsccondrec
  from parceiros p
  left join formas_pagar_receber f on p.forma = f.forma
  left join condicoes_recebimento c on p.codcondrec = c.codcondrec
`;

module.exports = {
  findById: `${baseSelect} where p.parceiro = ?`,
  list: `${baseSelect} order by p.fantasia`
};
