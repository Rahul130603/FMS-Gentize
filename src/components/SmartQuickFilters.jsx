import React from 'react';
import { 
  Users, 
  UserX, 
  RefreshCw, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

export default function SmartQuickFilters({ 
  records, 
  activeFilter, 
  onFilterChange 
}) {
  // Count records for each quick filter
  const counts = {
    all: records.length,
    noActivity: records.filter(r => r.status === 'No Activity' || (r.downloaded === 0 && r.completed === 0 && r.wip === 0)).length,
    wip: records.filter(r => r.status === 'WIP' || r.status === 'In Progress').length,
    rework: records.filter(r => r.rework > 0 || r.status === 'Rework').length,
    completed: records.filter(r => r.status === 'Completed').length
  };

  const chips = [
    { key: 'all', label: 'All', count: counts.all, icon: Users, color: '#3b82f6' },
    { key: 'noActivity', label: 'No Activity', count: counts.noActivity, icon: UserX, color: '#64748b' },
    { key: 'wip', label: 'WIP', count: counts.wip, icon: Layers, color: '#2563eb' },
    { key: 'rework', label: 'Rework', count: counts.rework, icon: RefreshCw, color: '#a855f7' },
    { key: 'completed', label: 'Completed', count: counts.completed, icon: CheckCircle2, color: '#10b981' }
  ];

  return (
    <div className="smart-quick-filters-bar" role="toolbar" aria-label="Smart Quick Filters">
      <span className="smart-filters-title">Quick Filter:</span>
      <div className="smart-chips-group">
        {chips.map((chip) => {
          const Icon = chip.icon;
          const isActive = activeFilter === chip.key;

          return (
            <button
              key={chip.key}
              type="button"
              className={`smart-filter-chip ${isActive ? 'active' : ''}`}
              onClick={() => onFilterChange(chip.key)}
              title={`Filter by ${chip.label}`}
            >
              <Icon size={13} style={{ color: isActive ? '#ffffff' : chip.color }} />
              <span>{chip.label}</span>
              <span className={`chip-counter ${isActive ? 'counter-active' : ''}`}>
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
