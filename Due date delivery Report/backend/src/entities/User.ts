import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type UserRole = 'Admin' | 'Manager' | 'HR' | 'Employee';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  password_hash!: string;

  @Column({ default: 'Employee' })
  role!: UserRole;

  @Column({ nullable: true })
  department?: string;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
