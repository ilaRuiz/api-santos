function normalizeCpfCnpj(value) {
  if (!value) {
    return {};
  }

  const digits = String(value).replace(/\D/g, '');

  if (digits.length <= 11) {
    return { cpf: value };
  }

  return { cnpj: value };
}

function normalizePayload(body, aliases) {
  const payload = { ...body };

  for (const [alias, target] of Object.entries(aliases)) {
    if (payload[alias] !== undefined && payload[target] === undefined) {
      payload[target] = payload[alias];
    }
  }

  if (payload.cpf_cnpj !== undefined && payload.cpf === undefined && payload.cnpj === undefined) {
    Object.assign(payload, normalizeCpfCnpj(payload.cpf_cnpj));
  }

  return payload;
}

function allowedValues(body, allowedFields) {
  return Object.entries(allowedFields).reduce((accumulator, [inputName, columnName]) => {
    if (body[inputName] !== undefined) {
      accumulator[columnName] = body[inputName];
    }

    return accumulator;
  }, {});
}

function buildInsert(tableName, values, returningColumn) {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    const error = new Error('Nenhum campo válido foi enviado para criação.');
    error.statusCode = 400;
    throw error;
  }

  const columns = entries.map(([column]) => column);
  const params = entries.map(([, value]) => value);
  const placeholders = columns.map(() => '?').join(', ');

  return {
    sql: `insert into ${tableName} (${columns.join(', ')}) values (${placeholders}) returning ${returningColumn}`,
    params
  };
}

function buildUpdate(tableName, idColumn, id, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    const error = new Error('Nenhum campo válido foi enviado para atualização.');
    error.statusCode = 400;
    throw error;
  }

  const assignments = entries.map(([column]) => `${column} = ?`).join(', ');
  const params = entries.map(([, value]) => value);

  return {
    sql: `update ${tableName} set ${assignments} where ${idColumn} = ?`,
    params: [...params, id]
  };
}

module.exports = {
  allowedValues,
  buildInsert,
  buildUpdate,
  normalizePayload
};
