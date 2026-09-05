import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Project } from './entities/Project';
import { Milestone } from './entities/Milestone';
import { Event } from './entities/Event';
import { User } from './entities/User';
import { Notification } from './entities/Notification';

dotenv.config();

// SQLite: a single local file, no server to install or run.
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'fms_delivery.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Only build the schema the first time the file doesn't exist yet. TypeORM's
// `synchronize` can decide a table needs dropping/recreating on repeated runs
// (driver metadata quirks, not real entity changes) which would silently wipe
// data on every dev-server restart if left on permanently.
const isFirstRun = !fs.existsSync(dbPath);

export const AppDataSource = new DataSource({
  type: 'sqljs',
  location: dbPath,
  autoSave: true,
  synchronize: isFirstRun,
  logging: false,
  entities: [Project, Milestone, Event, User, Notification],
});
