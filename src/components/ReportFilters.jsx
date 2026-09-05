import React from 'react';
import { Filter, RotateCcw, Bookmark } from 'lucide-react';
import { 
  ROLES, 
  DEPARTMENTS, 
  STATUS_TYPES 
} from '../data/dailyAllotmentDummyData';
import SavedFilterPresets from './SavedFilterPresets';

export default function ReportFilters({
  filters,
  setFilters,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onReset,
  onApply
}) {
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLoadPreset = (presetFilters) => {
    setFilters(prev => ({
      ...prev,
      ...presetFilters
    }));
  };

  return (
    <div className="filter-toolbar-container">
      {/* Filter Dropdowns Controls Grid */}
      <div className="filters-controls-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))' }}>
        {/* Department Filter */}
        <div className="filter-item">
          <label className="filter-label" htmlFor="filter-dept">Department</label>
          <select
            id="filter-dept"
            className="filter-select"
            value={filters.department || ''}
            onChange={(e) => handleFilterChange('department', e.target.value)}
          >
            <option value="">All Depts</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Role Filter */}
        <div className="filter-item">
          <label className="filter-label" htmlFor="filter-role">Role</label>
          <select
            id="filter-role"
            className="filter-select"
            value={filters.role || ''}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-item">
          <label className="filter-label" htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            className="filter-select"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div className="filter-item">
          <label className="filter-label" htmlFor="sort-by">Sort By</label>
          <select
            id="sort-by"
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="employeeName">Employee Name</option>
            <option value="employeeId">Employee ID</option>
            <option value="role">Role</option>
            <option value="allocated">Allocated Files</option>
            <option value="dailyTarget">Daily Target</option>
            <option value="completed">Completed Files</option>
            <option value="pending">Pending Files</option>
            <option value="rework">Rework Count</option>
            <option value="completionRate">Completion %</option>
            <option value="productivityScore">Productivity Score</option>
            <option value="status">Status (Workflow Order)</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="filter-item">
          <label className="filter-label" htmlFor="sort-order">Order</label>
          <select
            id="sort-order"
            className="filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            {sortBy === 'status' ? (
              <>
                <option value="priority">Attention First</option>
                <option value="reverse-priority">Completed First</option>
              </>
            ) : (
              <>
                <option value="asc">Ascending (A → Z, 1 → 9)</option>
                <option value="desc">Descending (Z → A, 9 → 1)</option>
              </>
            )}
          </select>
        </div>

        {/* Actions */}
        <div className="filter-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onReset}
            title="Reset all filters and sorting"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Saved Filter Views Bar */}
      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
        <SavedFilterPresets
          currentFilters={filters}
          onLoadPreset={handleLoadPreset}
        />
      </div>
    </div>
  );
}
