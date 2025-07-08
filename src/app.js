const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rutas
const engagementLogsRoutes = require('./routes/engagementLogs');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por ventana de tiempo
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware de seguridad
app.use(helmet());

// Middleware de CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Rate limiting
app.use(limiter);

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Rutas
app.use('/api/engagement-logs', engagementLogsRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Engagement Service API',
    version: '1.0.0',
    endpoints: {
      engagement_logs: '/api/engagement-logs',
      health: '/api/engagement-logs/health'
    }
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Engagement Service running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/engagement-logs/health`);
});

module.exports = app; 