import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Project } from './Project';

@Entity('delivery_milestones')
export class Milestone {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, (p) => p.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column()
  project_id!: number;

  @Column()
  stage!: string;

  @Column({ type: 'date', nullable: true })
  expected_date?: string;

  @Column({ type: 'date', nullable: true })
  actual_completed_date?: string;

  @Column({ nullable: true, type: 'text' })
  reason?: string;

  @CreateDateColumn()
  created_at!: Date;
}
