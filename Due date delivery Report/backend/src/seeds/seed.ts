import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { AppDataSource } from '../ormconfig';
import { User } from '../entities/User';
import { Project, PROJECT_TYPES, WORKFLOW_STAGES, PRIORITIES } from '../entities/Project';
import { Milestone } from '../entities/Milestone';
import { Event } from '../entities/Event';
import bcrypt from 'bcryptjs';

const DEPARTMENTS = ['Scanning', 'EPUB', 'POD', 'Cover Design', 'QC', 'QAG'];
const STATUSES_BY_STAGE: Record<string, string> = {
  Scanning: 'In Progress',
  EPDF: 'In Progress',
  POD: 'In Progress',
  'Cover Development': 'In Progress',
  QC: 'QC',
  QAG: 'QAG',
  'Ready for Delivery': 'Ready for Delivery',
  Delivered: 'Completed',
};

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

async function run() {
  await AppDataSource.initialize();
  console.log('DB initialized for seeding');

  const userRepo = AppDataSource.getRepository(User);
  const projectRepo = AppDataSource.getRepository(Project);
  const milestoneRepo = AppDataSource.getRepository(Milestone);
  const eventRepo = AppDataSource.getRepository(Event);

  const passwordHash = bcrypt.hashSync('password', 8);
  const users: Partial<User>[] = [
    { name: 'Alice Admin', email: 'alice@acme.com', password_hash: passwordHash, role: 'Admin' },
    { name: 'Maya Manager', email: 'maya@acme.com', password_hash: passwordHash, role: 'Manager', department: 'EPUB' },
    { name: 'Ravi Rao (Manager)', email: 'ravi@acme.com', password_hash: passwordHash, role: 'Manager', department: 'POD' },
    { name: 'Helen HR', email: 'helen@acme.com', password_hash: passwordHash, role: 'HR' },
    { name: 'John Employee', email: 'john@acme.com', password_hash: passwordHash, role: 'Employee', department: 'EPUB' },
    { name: 'Priya Patel', email: 'priya@acme.com', password_hash: passwordHash, role: 'Employee', department: 'Scanning' },
    { name: 'Sam Lee', email: 'sam@acme.com', password_hash: passwordHash, role: 'Employee', department: 'POD' },
    { name: 'Dana Cruz', email: 'dana@acme.com', password_hash: passwordHash, role: 'Employee', department: 'Cover Design' },
    { name: 'Omar Khan', email: 'omar@acme.com', password_hash: passwordHash, role: 'Employee', department: 'QC' },
  ];

  const savedUsers: User[] = [];
  for (const u of users) {
    let existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) existing = await userRepo.save(userRepo.create(u));
    savedUsers.push(existing);
  }

  const admin = savedUsers.find((u) => u.role === 'Admin')!;
  const managers = savedUsers.filter((u) => u.role === 'Manager');
  const employees = savedUsers.filter((u) => u.role === 'Employee');

  const existingCount = await projectRepo.count();
  if (existingCount > 0) {
    console.log(`Projects already seeded (${existingCount} rows). Skipping project seed.`);
    process.exit(0);
  }

  const clients = ['Pearson', 'Oxford University Press', 'Cambridge Press', 'Wiley', 'Springer', 'McGraw Hill'];
  const today = new Date();

  // Due-date offsets chosen to populate every dashboard bucket: overdue, today, tomorrow, 3/7/15/30 days, and far future.
  const dueOffsets = [-12, -5, -1, 0, 1, 2, 3, 5, 7, 10, 14, 15, 20, 25, 30, 45, 60, -20, 4, 6, 8, 12, 18, 22, 28, 35, 40, 50, -2, 9];

  for (let i = 0; i < dueOffsets.length; i++) {
    const stage = pick(WORKFLOW_STAGES, i);
    const priority = pick(PRIORITIES, i + 1);
    const type = pick(PROJECT_TYPES, i + 2);
    const department = pick(DEPARTMENTS, i);
    const employee = pick(employees, i);
    const manager = pick(managers, i);
    const dueOffset = dueOffsets[i];
    const dueDate = addDays(today, dueOffset);
    const startDate = addDays(dueDate, -45);
    const isDelivered = stage === 'Delivered';
    const completion = isDelivered ? 100 : Math.min(95, 20 + i * 3);

    const project = await projectRepo.save(
      projectRepo.create({
        project_number: `P-2026-${String(1000 + i)}`,
        isbn: `978-1-${String(10000 + i * 7).slice(0, 5)}-${String(100 + i).slice(0, 3)}-0`,
        book_title: `${pick(['Advanced', 'Introduction to', 'Principles of', 'Modern', 'Applied'], i)} ${pick(['Calculus', 'Chemistry', 'Physics', 'Economics', 'Literature', 'Data Science'], i + 1)} ${i + 1}`,
        client_name: pick(clients, i),
        project_type: type,
        department,
        assigned_to: employee.id,
        manager: manager.id,
        priority,
        workflow_stage: stage,
        completion_percentage: completion,
        start_date: iso(startDate),
        expected_delivery: iso(dueDate),
        due_date: iso(dueDate),
        actual_delivery: isDelivered ? iso(addDays(dueDate, dueOffset < 0 ? 2 : -1)) : undefined,
        status: dueOffset < 0 && !isDelivered ? 'Overdue' : STATUSES_BY_STAGE[stage] || 'In Progress',
        remarks: dueOffset < -5 ? 'Client requested revisions; awaiting sign-off.' : undefined,
      })
    );

    // Milestones: one per completed stage, plus the current stage (possibly missed).
    const stageIdx = WORKFLOW_STAGES.indexOf(stage);
    for (let s = 0; s <= stageIdx; s++) {
      const expected = addDays(startDate, (s + 1) * 5);
      const isCurrent = s === stageIdx;
      const missedThisOne = isCurrent && i % 4 === 0 && !isDelivered;
      await milestoneRepo.save(
        milestoneRepo.create({
          project_id: project.id,
          stage: WORKFLOW_STAGES[s],
          expected_date: iso(expected),
          actual_completed_date: isCurrent && !missedThisOne ? undefined : iso(missedThisOne ? addDays(expected, 4) : expected),
        })
      );
    }

    await eventRepo.save(eventRepo.create({ project_id: project.id, actor: admin.id, event: 'Project Created', new_status: 'Assigned' }));
    await eventRepo.save(eventRepo.create({ project_id: project.id, actor: manager.id, event: `${stage} Started`, old_status: 'Assigned', new_status: project.status }));
  }

  console.log(`Seeding complete: ${savedUsers.length} users, ${dueOffsets.length} projects.`);
  console.log('Login with any seeded user email and password "password".');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
