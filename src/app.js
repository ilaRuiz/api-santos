const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const config = require('./config');
const healthRoutes = require('./routes/healthRoutes');
const operadoresRoutes = require('./routes/operadoresRoutes');
const ordensServicoRoutes = require('./routes/ordensServicoRoutes');
const parceirosRoutes = require('./routes/parceirosRoutes');
const servicosRoutes = require('./routes/servicosRoutes');
const tecnicosRoutes = require('./routes/tecnicosRoutes');
const veiculosRoutes = require('./routes/veiculosRoutes');

const app = express();

function corsOptions() {
  if (config.corsOrigins.includes('*')) {
    return { origin: true };
  }

  return {
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origem não permitida pelo CORS.'));
    }
  };
}

app.use(helmet());
app.use(cors(corsOptions()));
app.use(express.json({ limit: '1mb' }));

app.use('/health', healthRoutes);
app.use('/api/:database/operadores', operadoresRoutes);
app.use('/api/:database/os', ordensServicoRoutes);
app.use('/api/:database/parceiros', parceirosRoutes);
app.use('/api/:database/servicos', servicosRoutes);
app.use('/api/:database/tecnicos', tecnicosRoutes);
app.use('/api/:database/veiculos', veiculosRoutes);

app.use((request, response) => {
  response.status(404).json({
    error: 'Rota não encontrada.'
  });
});

app.use((error, request, response, next) => {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: error.message || 'Erro interno no servidor.'
  });
});

module.exports = app;
