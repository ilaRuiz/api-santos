const os = require('os');
const app = require('./app');
const config = require('./config');
const firebird = require('./db/firebird');

function networkUrls(port) {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((details) => details?.family === 'IPv4' && !details.internal)
    .map((details) => `http://${details.address}:${port}`);
}

const server = app.listen(config.port, config.host, () => {
  console.log(`API Firebird online em http://${config.host}:${config.port}`);

  if (config.host === '0.0.0.0') {
    console.log(`Local: http://localhost:${config.port}`);
    console.log(`Rede: ${networkUrls(config.port).join(', ') || 'nenhum IP de rede encontrado'}`);
  }

  console.log(`Bancos configurados: ${firebird.configuredDatabaseNames().join(', ') || 'nenhum'}`);
});

function shutdown(signal) {
  console.log(`Recebido ${signal}. Encerrando API...`);
  server.close(() => {
    firebird.closePools();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
