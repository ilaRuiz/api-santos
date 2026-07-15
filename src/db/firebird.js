const Firebird = require('node-firebird');
const config = require('../config');

const pools = new Map();

function registerPools() {
  for (const database of config.databases) {
    pools.set(
      database.name,
      Firebird.pool(database.poolSize, database.options)
    );
  }
}

function configuredDatabaseNames() {
  return Array.from(pools.keys());
}

function getPool(databaseName) {
  const normalizedName = String(databaseName || '').toLowerCase();
  const pool = pools.get(normalizedName);

  if (!pool) {
    const available = configuredDatabaseNames();
    const suffix = available.length ? ` Bancos configurados: ${available.join(', ')}.` : '';
    const error = new Error(`Banco Firebird "${databaseName}" não configurado.${suffix}`);
    error.statusCode = 404;
    throw error;
  }

  return pool;
}

function withDatabase(databaseName, callback) {
  const pool = getPool(databaseName);

  return new Promise((resolve, reject) => {
    pool.get((connectionError, db) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }

      Promise.resolve()
        .then(() => callback(db))
        .then(resolve)
        .catch(reject)
        .finally(() => {
          db.detach();
        });
    });
  });
}

function query(databaseName, sql, params = []) {
  return withDatabase(databaseName, (db) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result || []);
      });
    })
  );
}

function transactionQuery(transaction, sql, params = []) {
  return new Promise((resolve, reject) => {
    transaction.query(sql, params, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result || []);
    });
  });
}

function transactionExecute(transaction, sql, params = []) {
  return new Promise((resolve, reject) => {
    transaction.execute(sql, params, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result || []);
    });
  });
}

function commit(transaction) {
  return new Promise((resolve, reject) => {
    transaction.commit((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function rollback(transaction) {
  return new Promise((resolve) => {
    transaction.rollback(() => resolve());
  });
}

function runInTransaction(databaseName, callback) {
  return withDatabase(
    databaseName,
    (db) =>
      new Promise((resolve, reject) => {
        db.transaction(Firebird.ISOLATION_READ_COMMITTED, async (error, transaction) => {
          if (error) {
            reject(error);
            return;
          }

          try {
            const result = await callback({
              execute: (sql, params) => transactionExecute(transaction, sql, params),
              query: (sql, params) => transactionQuery(transaction, sql, params)
            });

            await commit(transaction);
            resolve(result);
          } catch (transactionError) {
            await rollback(transaction);
            reject(transactionError);
          }
        });
      })
  );
}

function execute(databaseName, sql, params = []) {
  return withDatabase(databaseName, (db) =>
    new Promise((resolve, reject) => {
      db.execute(sql, params, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result || []);
      });
    })
  );
}

function closePools() {
  for (const pool of pools.values()) {
    pool.destroy();
  }
}

registerPools();

module.exports = {
  closePools,
  configuredDatabaseNames,
  execute,
  runInTransaction,
  query
};
