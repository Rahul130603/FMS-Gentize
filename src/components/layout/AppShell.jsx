import React, { useState } from 'react';
import { 
  Layers, 
  FolderKanban, 
  FileText, 
  BarChart3, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  HelpCircle, 
  FileSpreadsheet, 
  CheckCircle,
  Menu
} from 'lucide-react';

export default function AppShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout-shell">
      {/* Sidebar */}
      <aside className={`app-sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <Layers size={20} />
          </div>
          {!sidebarCollapsed && (
            <div className="brand-text">
              <span className="brand-title">E-Publishing RMS</span>
              <span className="brand-subtitle">Production & Allotment</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {!sidebarCollapsed ? 'Workspace' : '•••'}
          </div>

          <button type="button" className="nav-item">
            <FolderKanban size={18} className="nav-item-icon" />
            {!sidebarCollapsed && <span>File Allocation</span>}
          </button>

          <button type="button" className="nav-item">
            <Users size={18} className="nav-item-icon" />
            {!sidebarCollapsed && <span>Employee Roster</span>}
          </button>

          <div className="nav-section-title">
            {!sidebarCollapsed ? 'Analytics & Reports' : '•••'}
          </div>

          {/* Active Route: Reports -> Daily Allotment Status */}
          <button type="button" className="nav-item active">
            <BarChart3 size={18} className="nav-item-icon" />
            {!sidebarCollapsed && <span>Daily Allotment Status</span>}
          </button>

          <button type="button" className="nav-item">
            <FileSpreadsheet size={18} className="nav-item-icon" />
            {!sidebarCollapsed && <span>Monthly Throughput</span>}
          </button>

          <button type="button" className="nav-item">
            <CheckCircle size={18} className="nav-item-icon" />
            {!sidebarCollapsed && <span>Quality & QC Audit</span>}
          </button>

          <div className="nav-section-title">
            {!sidebarCollapsed ? 'System' : '•••'}
          </div>

          <button type="button" className="nav-item">
            <Settings size={18} className="nav-item-icon" />
            {!sidebarCollapsed && <span>Workflow Settings</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          {!sidebarCollapsed ? (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">AD</div>
              <div className="sidebar-user-details">
                <span className="sidebar-user-name">Admin Manager</span>
                <span className="sidebar-user-role">ePub Operations</span>
              </div>
            </div>
          ) : (
            <div className="sidebar-user-avatar">AD</div>
          )}

          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Main App Canvas */}
      <div className="app-main-wrapper">
        {/* Top Header / App Bar */}
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: 'inline-flex' }}
            >
              <Menu size={18} />
            </button>

            <div className="topbar-breadcrumbs">
              <span>Production Portal</span>
              <span>/</span>
              <span>Reports</span>
              <span>/</span>
              <span className="breadcrumb-active">Daily Allotment Status</span>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="system-status-indicator" title="System synchronizer active">
              <span className="status-dot-pulse" />
              <span>Production Live</span>
            </div>

            <button 
              type="button" 
              className="sidebar-toggle-btn" 
              style={{ color: '#475569' }} 
              title="Notifications"
            >
              <Bell size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #e2e8f0', paddingLeft: '14px' }}>
              <div className="emp-avatar-sm" style={{ background: '#2563eb', color: '#ffffff' }}>
                MG
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                Shift Manager
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="app-scroll-content">
          {children}
        </main>
      </div>
    </div>
  );
}
