import React, { useState, useMemo } from 'react';
import { 
  Clock8, 
  Search, 
  ExternalLink, 
  X, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  UserCheck,
  Filter
} from 'lucide-react';
import { 
  getTwoHourTrackingData, 
  CURRENT_REPORT_DATE 
} from '../data/dailyAllotmentDummyData';
import { getEmployeeTwoHourStats } from '../utils/statusCalculations';
import { exportTwoHourReportToExcel } from '../utils/exportUtils';

export default function TwoHourEmployeeBreakdown({
  selectedSlot,
  onSelectSlot,
  selectedDate,
  records = [],
  onClose,
  onSelectEmployee
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const isToday = !selectedDate || selectedDate === CURRENT_REPORT_DATE;

  const trackingData = useMemo(() => {
    return getTwoHourTrackingData(selectedDate);
  }, [selectedDate]);

  const activeSlotData = useMemo(() => {
    return trackingData.find(d => d.slot === selectedSlot) || trackingData[0];
  }, [trackingData, selectedSlot]);

  // Compute individual employee statistics for the selected 2-hour window
  const employeeSlotBreakdown = useMemo(() => {
    if (!activeSlotData) return [];

    return records.map(emp => {
      const stats = getEmployeeTwoHourStats(emp, activeSlotData.timeWindow, isToday);
      return {
        ...emp,
        ...stats
      };
    }).sort((a, b) => b.slotCompleted - a.slotCompleted);
  }, [records, activeSlotData, isToday]);

  // Filtered employee list
  const filteredEmployees = useMemo(() => {
    let list = employeeSlotBreakdown;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(e => 
        e.employeeName.toLowerCase().includes(q) || 
        e.employeeId.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'active') {
      list = list.filter(e => e.slotCompleted > 0);
    } else if (statusFilter === 'met') {
      list = list.filter(e => e.slotStatus === 'Target Met');
    } else if (statusFilter === 'behind') {
      list = list.filter(e => e.slotStatus === 'Behind Pace');
    }

    return list;
  }, [employeeSlotBreakdown, searchQuery, statusFilter]);

  const activeInSlotCount = useMemo(() => {
    return employeeSlotBreakdown.filter(e => e.slotCompleted > 0).length;
  }, [employeeSlotBreakdown]);

  const targetMetCount = useMemo(() => {
    return employeeSlotBreakdown.filter(e => e.slotStatus === 'Target Met').length;
  }, [employeeSlotBreakdown]);

  const handleExportSlotExcel = () => {
    exportTwoHourReportToExcel({
      slotData: [activeSlotData],
      employees: records,
      selectedDate: selectedDate || CURRENT_REPORT_DATE,
      activeSlot: activeSlotData.slot
    });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Target Met':
        return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'On Track':
        return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      case 'Behind Pace':
        return { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
      case 'Upcoming':
        return { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
      default:
        return { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
    }
  };

  if (!activeSlotData) return null;

  return (
    <div 
      className="dashboard-card" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: activeSlotData.isCurrent ? '1px solid #93c5fd' : '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ 
              background: activeSlotData.isFuture ? '#64748b' : '#2563eb', 
              color: '#ffffff', 
              fontSize: '11px', 
              fontWeight: '700', 
              padding: '2px 8px', 
              borderRadius: '4px' 
            }}>
              {activeSlotData.slot}
            </span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>
              {activeSlotData.timeWindow}
            </strong>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              ({activeSlotData.session})
            </span>
            {activeSlotData.isFuture && (
              <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' }}>
                ⏳ Future Time Window (Empty)
              </span>
            )}
            {activeSlotData.isCurrent && (
              <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '1px 6px', borderRadius: '10px', fontWeight: '700' }}>
                ⚡ Active Live Shift
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
            Individual employee files completed and quality status during this 2-hour production window
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Quick Slot Switcher tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px', gap: '2px' }}>
            {trackingData.map(slot => (
              <button
                key={slot.slot}
                type="button"
                onClick={() => onSelectSlot && onSelectSlot(slot.slot)}
                style={{
                  padding: '3px 7px',
                  fontSize: '10px',
                  fontWeight: selectedSlot === slot.slot ? '700' : '500',
                  color: selectedSlot === slot.slot ? '#ffffff' : '#475569',
                  background: selectedSlot === slot.slot ? '#2563eb' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {slot.slot}
              </button>
            ))}
          </div>

          {/* Export Slot Excel Button */}
          <button
            type="button"
            onClick={handleExportSlotExcel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#1e293b',
              cursor: 'pointer',
              marginLeft: '4px'
            }}
            title={`Export ${activeSlotData.slot} employee list to Excel`}
          >
            <FileSpreadsheet size={13} style={{ color: '#059669' }} />
            <span>Export Slot Excel</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px'
            }}
            title="Close employee status list"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Informative Alert for Future Slot (Slot 4: 3.30 PM to 5.30 PM) */}
      {activeSlotData.isFuture && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '10px 12px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          marginBottom: '12px',
          color: '#334155',
          fontSize: '12px'
        }}>
          <Clock8 size={18} style={{ color: '#64748b', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#0f172a' }}>Future Production Time Window (3.30 PM to 5.30 PM):</strong>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Current real-time shift is <strong>~2:18 PM</strong> (Slot 3: 12.45 PM to 3.30 PM is active). 
              This closing window has not started yet, so all 40 employee file completions are currently <strong>0</strong>. Production tracking for this window will activate after 3:30 PM.
            </div>
          </div>
        </div>
      )}

      {/* Quick Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              border: statusFilter === 'all' ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: statusFilter === 'all' ? '#eff6ff' : '#f8fafc',
              color: statusFilter === 'all' ? '#2563eb' : '#64748b',
              fontWeight: statusFilter === 'all' ? '600' : 'normal',
              cursor: 'pointer'
            }}
          >
            All ({employeeSlotBreakdown.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            style={{
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              border: statusFilter === 'active' ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: statusFilter === 'active' ? '#eff6ff' : '#f8fafc',
              color: statusFilter === 'active' ? '#2563eb' : '#64748b',
              fontWeight: statusFilter === 'active' ? '600' : 'normal',
              cursor: 'pointer'
            }}
          >
            Active ({activeInSlotCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('met')}
            style={{
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              border: statusFilter === 'met' ? '1px solid #059669' : '1px solid #e2e8f0',
              background: statusFilter === 'met' ? '#ecfdf5' : '#f8fafc',
              color: statusFilter === 'met' ? '#059669' : '#64748b',
              fontWeight: statusFilter === 'met' ? '600' : 'normal',
              cursor: 'pointer'
            }}
          >
            Target Met ({targetMetCount})
          </button>
        </div>

        {/* Search Box */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={12} style={{ position: 'absolute', left: '8px', top: '9px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search employee by name, ID, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '5px 8px 5px 26px',
              fontSize: '11px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Employee List Table */}
      <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
              <th style={{ padding: '8px 10px' }}>Employee</th>
              <th style={{ padding: '8px 10px' }}>Role</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>2-Hr Completed</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>QC Approved</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Window Status</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '12px' }}>
                  {activeSlotData.isFuture 
                    ? '⏳ No production in this upcoming window yet (Starts at 3:30 PM).' 
                    : 'No employees match your search or filter for this 2-hour window.'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const badge = getStatusBadgeStyle(emp.slotStatus);
                return (
                  <tr 
                    key={emp.id} 
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Employee Name */}
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: '#e0e7ff',
                          color: '#3730a3',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: '700'
                        }}>
                          {emp.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                        <div>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{emp.employeeName}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{emp.employeeId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '8px 10px', color: '#475569', fontSize: '11px' }}>
                      {emp.role}
                    </td>

                    {/* 2-Hour Completed */}
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <strong style={{ color: emp.slotCompleted > 0 ? '#2563eb' : '#94a3b8', fontSize: '13px' }}>
                        {emp.slotCompleted}
                      </strong>
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '3px' }}>
                        / {emp.slotTarget} target
                      </span>
                    </td>

                    {/* QC Approved */}
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <span style={{ color: emp.slotQcPassed > 0 ? '#059669' : '#94a3b8', fontWeight: '600' }}>
                        {emp.slotQcPassed}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        {emp.slotStatus}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title={`Inspect docket for ${emp.employeeName}`}
                      >
                        <span>Details</span>
                        <ExternalLink size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Breakdown Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#64748b' }}>
        <span>Showing <strong>{filteredEmployees.length}</strong> employees for <strong>{activeSlotData.timeWindow}</strong></span>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}
        >
          Done / Close Breakdown
        </button>
      </div>
    </div>
  );
}
