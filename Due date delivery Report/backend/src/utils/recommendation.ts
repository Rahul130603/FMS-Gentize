import { Project } from '../entities/Project';
import { HealthBreakdown } from './healthScore';

/** Rule-based "Smart Recommendation" engine — deterministic heuristics, not a live ML model. */
export function generateRecommendations(project: Project, health: HealthBreakdown): string[] {
  const recs: string[] = [];
  const remaining = health.daysRemaining.remaining;

  if (project.status === 'Completed' || project.workflow_stage === 'Delivered') {
    recs.push('Project has been delivered. No further action required.');
    return recs;
  }

  if (remaining !== null && remaining < 0) {
    recs.push(`Project is overdue by ${Math.abs(remaining)} day(s). Immediate managerial attention required.`);
  } else if (remaining === 0) {
    recs.push('Project is due today. Confirm final delivery steps now.');
  } else if (remaining !== null && remaining <= 2) {
    recs.push(`Only ${remaining} day(s) remain before delivery. Prioritize this project.`);
  }

  if (health.missedMilestones.count >= 2) {
    recs.push(`${health.missedMilestones.count} milestones have already been missed. Assign additional resources.`);
  } else if (health.missedMilestones.count === 1) {
    const m = health.missedMilestones.items[0];
    recs.push(`${m.stage} stage is taking longer than expected (${m.delayDays}d late).`);
  }

  if (health.workflow.currentStage === 'QC' && project.completion_percentage < 80) {
    recs.push('QC should be prioritized to keep downstream QAG/delivery on schedule.');
  }
  if (health.workflow.currentStage === 'Scanning' && remaining !== null && remaining <= 15) {
    recs.push('QC should begin within the next few days to stay on track.');
  }

  if (project.priority === 'Critical' || project.priority === 'Urgent') {
    if (health.score < 60) recs.push(`${project.priority} priority project with low health score — escalate to management.`);
  }

  if (health.score >= 80 && recs.length === 0) {
    recs.push('Project is on schedule and healthy. Continue current pace.');
  }

  if (health.score < 40) {
    recs.push('Project is likely to miss the due date without intervention.');
  }

  if (recs.length === 0) recs.push('Project is on schedule.');
  return recs;
}
