import { applyMigrations } from '../src/utils/migrations';
import { config } from '../src/config/env';

applyMigrations(config.databaseUrl, true)
  .then(() => {
    console.log('Migraciones aplicadas correctamente.');
  })
  .catch((error) => {
    console.error('Fallo al ejecutar migraciones:', error);
    process.exit(1);
  });
