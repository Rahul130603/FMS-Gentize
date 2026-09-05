import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Event } from './Event';
import { Milestone } from './Milestone';
import { User } from './User';

export const PROJECT_TYPES = ['Scanning', 'EPDF', 'POD', 'Cover Development', 'QC', 'QAG', 'Final Delivery', 'Other'] as const;
export const WORKFLOW_STAGES = ['Scanning', 'EPDF', 'POD', 'Cover Development', 'QC', 'QAG', 'Ready for Delivery', 'Delivered'] as const;
export const PROJECT_STATUSES = ['Upcoming', 'Assigned', 'In Progress', 'QC', 'QAG', 'Ready for Delivery', 'Completed', 'Delayed', 'Overdue', 'On Hold', 'Cancelled'] as const;
export const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent', 'Critical'] as const;

@Entity('delivery_projects')
@Index(['due_date'])
@Index(['status'])
@Index(['assigned_to'])
@Index(['manager'])
@Index(['workflow_stage'])
@Index(['department'])
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  project_number!: string;

  @Column({ nullable: true })
  isbn?: string;

  @Column()
  book_title!: string;

  @Column({ nullable: true })
  client_name?: string;

  @Column()
  project_type!: string;

  @Column({ nullable: true })
  department?: string;

  @Column({ nullable: true })
  assigned_to?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedEmployee?: User;

  @Column({ nullable: true })
  manager?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager' })
  managerUser?: User;

  @Column({ default: 'Normal' })
  priority!: string;

  @Column({ default: 'Scanning' })
  workflow_stage!: string;

  @Column({ default: 0 })
  completion_percentage!: number;

  @Column({ type: 'date', nullable: true })
  start_date?: string;

  @Column({ type: 'date', nullable: true })
  expected_delivery?: string;

  @Column({ type: 'date', nullable: true })
  due_date?: string;

  @Column({ type: 'date', nullable: true })
  actual_delivery?: string;

  @Column({ default: 'Upcoming' })
  status!: string;

  @Column({ nullable: true, type: 'text' })
  remarks?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Event, (e) => e.project)
  events?: Event[];

  @OneToMany(() => Milestone, (m) => m.project)
  milestones?: Milestone[];
}
