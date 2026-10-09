// Env untuk test: terisolasi dari .env developer, dan tidak butuh database sungguhan.
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test';
process.env.CORS_ORIGIN = '';
process.env.TRUST_PROXY = '0';
process.env.RATE_LIMIT_MAX = '1000';
