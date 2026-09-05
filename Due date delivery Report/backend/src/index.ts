import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and set a value before starting the server.');
  process.exit(1);
}

import { AppDataSource } from './ormconfig';
import app from './app';
import AlertService from './services/alert.service';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source initialized');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    AlertService.scan().catch((err) => console.error('Alert scan failed', err));
    setInterval(() => {
      AlertService.scan().catch((err) => console.error('Alert scan failed', err));
    }, 60 * 60 * 1000);
  })
  .catch((err: any) => {
    console.error('Error during Data Source initialization', err);
    process.exit(1);
  });
