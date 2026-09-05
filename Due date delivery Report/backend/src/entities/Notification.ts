import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('notifications')
@Index(['user_id'])
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column({ nullable: true })
  project_id?: number;

  @Column()
  type!: string;

  @Column()
  message!: string;

  @Column({ default: false })
  acknowledged!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
