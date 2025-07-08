// Configuración global para tests
require('dotenv').config({ path: '.env.test' });

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'runinsight_test_db';

// Configurar console.log para tests (opcional)
if (process.env.SILENT_TESTS) {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}

// Configurar timeout global para tests
jest.setTimeout(10000); 