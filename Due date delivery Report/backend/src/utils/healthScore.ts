import { Project, WORKFLOW_STAGES } from '../entities/Project';
import { Milestone } from '../entities/Milestone';
import { daysRemaining, dueLabel, dueColor } from './dateUtils';

const clamp = (v: number) => Math.max(0, Math.min(100, v));

export function completionStatus(pct: number) {
  if (pct >= 100) return { label: 'Excellent', color: '#16a34a' };
  if (pct >= 80) return { label: 'Good', color: '#22c55e' };
  if (pct >= 60) return { label: 'Average', color: '#eab308' };
  if (pct >= 40) return { label: 'Warning', color: '#f97316' };
  return { label: 'Critical', color: '#ef4444' };
}

const PRIORITY_SCORE: Record<string, number> = {
  Low: 15,
  Normal: 12,
  High: 8,
  Urgent: 4,
  Critical: 0,
};

export interface HealthBreakdown {
  score: number;
  category: string;
  risk: string;
  completion: { score: number; max: number; percentage: number; status: ReturnType<typeof completionStatus> };
  daysRemaining: { score: number; max: number; remaining: number | null; label: string; color: string };
  workflow: { score: number; max: number; currentStage: string; completedStages: string[]; remainingStages: string[] };
  priority: { score: number; max: number; level: string };
  missedMilestones: {
    score: number;
    max: number;
    count: number;
    items: { stage: string; expected_date?: string; delayDays: number }[];
  };
}

export function computeHealthScore(project: Project, milestones: Milestone[] = []): HealthBreakdown {
  const completionScore = (project.completion_percentage / 100) * 30;

  const remaining = daysRemaining(project.due_date);
  let daysRemainingScore = 12.5;
  if (remaining !== null) {
    if (remaining < 0) daysRemainingScore = 0;
    else if (remaining <= 2) daysRemainingScore = 6.25;
    else if (remaining <= 6) daysRemainingScore = 12.5;
    else if (remaining <= 15) daysRemainingScore = 18.75;
    else daysRemainingScore = 25;
  }

  const order = [...WORKFLOW_STAGES];
  const idxCurrent = order.indexOf(project.workflow_stage as any);
  const workflowScore = idxCurrent >= 0 ? (idxCurrent / (order.length - 1)) * 20 : 10;
  const completedStages = idxCurrent >= 0 ? order.slice(0, idxCurrent) : [];
  const remainingStages = idxCurrent >= 0 ? order.slice(idxCurrent + 1) : order;

  const priorityScore = PRIORITY_SCORE[project.priority] ?? 12;

  const missedItems = milestones
    .filter((m) => m.expected_date && (!m.actual_completed_date || new Date(m.actual_completed_date) > new Date(m.expected_date)))
    .map((m) => {
      const expected = new Date(m.expected_date as string);
      const end = m.actual_completed_date ? new Date(m.actual_completed_date) : new Date();
      const delay = Math.max(0, Math.round((end.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24)));
      return { stage: m.stage, expected_date: m.expected_date, delayDays: delay };
    });
  const missedPenalty = Math.min(10, missedItems.length * 2);
  const missedScore = Math.max(0, 10 - missedPenalty);

  const raw = completionScore + daysRemainingScore + workflowScore + priorityScore + missedScore;
  const score = clamp(Math.round(raw));

  const category =
    score >= 95 ? 'Excellent' :
    score >= 80 ? 'Healthy' :
    score >= 60 ? 'Needs Attention' :
    score >= 40 ? 'At Risk' : 'Critical';

  const risk =
    score >= 80 ? 'Low Risk' :
    score >= 60 ? 'Medium Risk' :
    score >= 40 ? 'High Risk' : 'Critical Risk';

  return {
    score,
    category,
    risk,
    completion: { score: Math.round(completionScore), max: 30, percentage: project.completion_percentage, status: completionStatus(project.completion_percentage) },
    daysRemaining: { score: Math.round(daysRemainingScore), max: 25, remaining, label: dueLabel(remaining), color: dueColor(remaining) },
    workflow: { score: Math.round(workflowScore), max: 20, currentStage: project.workflow_stage, completedStages, remainingStages },
    priority: { score: priorityScore, max: 15, level: project.priority },
    missedMilestones: { score: missedScore, max: 10, count: missedItems.length, items: missedItems },
  };
}
