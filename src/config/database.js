require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'runinsight_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // Máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo máximo que una conexión puede estar inactiva
  connectionTimeoutMillis: 2000, // Tiempo máximo para establecer una conexión
};

module.exports = config; 