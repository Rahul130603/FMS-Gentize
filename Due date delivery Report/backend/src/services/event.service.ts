import { AppDataSource } from '../ormconfig';
import { Event } from '../entities/Event';

export default class EventService {
  static async logEvent(payload: Partial<Event>) {
    const repo = AppDataSource.getRepository(Event);
    const ev = repo.create(payload as Event);
    return repo.save(ev);
  }

  static async timeline(project_id: number) {
    const repo = AppDataSource.getRepository(Event);
    return repo.find({ where: { project_id }, order: { created_at: 'ASC' } });
  }
}
