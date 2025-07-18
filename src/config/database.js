require('dotenv').config();

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, 
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

module.exports = config; 