import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Project } from './Project';

@Entity('delivery_events')
@Index(['project_id'])
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, (p) => p.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column()
  project_id!: number;

  @Column({ nullable: true })
  actor?: number;

  @Column()
  event!: string;

  @Column({ nullable: true })
  old_status?: string;

  @Column({ nullable: true })
  new_status?: string;

  @Column({ nullable: true, type: 'text' })
  note?: string;

  @CreateDateColumn()
  created_at!: Date;
}
