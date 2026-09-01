import { config } from './config/env';
import { pool } from './config/db';
import { createApp } from './app';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Backend escuchando en http://localhost:${config.port}`);
  console.log(`Entorno: ${config.nodeEnv}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Recibida señal ${signal}. Cerrando servidor...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
