import React, { useState } from 'react';
import { Bookmark, Plus, Trash2, Check } from 'lucide-react';
import { DEFAULT_SAVED_PRESETS } from '../data/dailyAllotmentDummyData';

export default function SavedFilterPresets({ 
  currentFilters, 
  onLoadPreset 
}) {
  const [savedPresets, setSavedPresets] = useState(() => {
    try {
      const stored = localStorage.getItem('daily_allotment_saved_views');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => {
            const cleanFilters = {};
            if (p.filters) {
              ['date', 'startDate', 'endDate', 'department', 'role', 'status'].forEach(k => {
                if (p.filters[k] !== undefined) cleanFilters[k] = p.filters[k];
              });
            }
            return { ...p, filters: cleanFilters };
          });
        }
      }
      return DEFAULT_SAVED_PRESETS;
    } catch {
      return DEFAULT_SAVED_PRESETS;
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleSaveCurrent = (e) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      filters: { ...currentFilters }
    };

    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    try {
      localStorage.setItem('daily_allotment_saved_views', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setNewPresetName('');
    setIsAdding(false);
  };

  const handleDeletePreset = (id, e) => {
    e.stopPropagation();
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    try {
      localStorage.setItem('daily_allotment_saved_views', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="saved-presets-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>
        <Bookmark size={13} className="text-blue-600" />
        <span>Saved Views:</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {savedPresets.map((preset) => (
          <div
            key={preset.id}
            className="preset-pill-btn"
            onClick={() => onLoadPreset(preset.filters)}
            title={`Load view: ${preset.name}`}
          >
            <span>{preset.name}</span>
            {preset.id.startsWith('preset-') && !DEFAULT_SAVED_PRESETS.some(d => d.id === preset.id) && (
              <button
                type="button"
                className="preset-delete-btn"
                onClick={(e) => handleDeletePreset(preset.id, e)}
                title="Delete this view"
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        ))}

        {isAdding ? (
          <form onSubmit={handleSaveCurrent} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="text"
              placeholder="View name..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="filter-select"
              style={{ height: '28px', padding: '2px 8px', fontSize: '12px', width: '130px' }}
              autoFocus
            />
            <button type="submit" className="btn-primary" style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}>
              <Check size={12} />
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsAdding(false)}
              style={{ height: '28px', padding: '0 6px', fontSize: '11px' }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsAdding(true)}
            style={{ height: '26px', padding: '0 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            title="Save current filters as a preset view"
          >
            <Plus size={12} />
            <span>Save Current</span>
          </button>
        )}
      </div>
    </div>
  );
}
