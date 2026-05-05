import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import { 
  Settings as SettingsIcon, Shield, FileText, Download, 
  CheckCircle2, AlertTriangle, Eye, Calendar, Filter,
  Database, Lock, Clock, Search, ChevronDown
} from 'lucide-react';

// Generate demo audit log data
function generateAuditLogs() {
  const actions = [
    { action: 'Field Mapping Updated', entity: 'company_name → CustomerName', user: 'john@company.com', severity: 'info' },
    { action: 'Sync Rule Created', entity: 'CRM Deal Sync', user: 'sarah@company.com', severity: 'info' },
    { action: 'Connection Established', entity: 'HubSpot CRM', user: 'john@company.com', severity: 'success' },
    { action: 'Field Value Changed', entity: 'deal_value: $45,000 → $52,000', user: 'system', severity: 'warning' },
    { action: 'Sync Completed', entity: 'Batch #4021 — 241 records', user: 'system', severity: 'success' },
    { action: 'Permission Modified', entity: 'User role: viewer → editor', user: 'admin@company.com', severity: 'warning' },
    { action: 'Data Source Uploaded', entity: 'Q1_financials.xlsx', user: 'sarah@company.com', severity: 'info' },
    { action: 'Connection Refreshed', entity: 'QuickBooks OAuth Token', user: 'system', severity: 'info' },
    { action: 'Sync Error Resolved', entity: 'Duplicate record merge', user: 'john@company.com', severity: 'success' },
    { action: 'Field Diff Detected', entity: 'contact_email: old@co.com → new@co.com', user: 'system', severity: 'warning' },
    { action: 'Template Installed', entity: 'Accounting Firm Onboarding', user: 'admin@company.com', severity: 'info' },
    { action: 'Export Generated', entity: 'March 2026 Sync Report', user: 'sarah@company.com', severity: 'info' },
  ];
  
  const logs = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const a = actions[i % actions.length];
    const date = new Date(now);
    date.setHours(date.getHours() - i * 4);
    logs.push({
      id: `audit-${i}`,
      timestamp: date.toISOString(),
      ...a,
    });
  }
  return logs;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Settings() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('audit');
  const [auditLogs] = useState(generateAuditLogs);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-04');

  const months = [
    { value: '2026-04', label: 'April 2026' },
    { value: '2026-03', label: 'March 2026' },
    { value: '2026-02', label: 'February 2026' },
    { value: '2026-01', label: 'January 2026' },
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchSearch = !searchQuery || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSeverity && matchSearch;
  });

  const exportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Entity', 'User', 'Severity'];
    const rows = filteredLogs.map(l => [
      new Date(l.timestamp).toLocaleString(),
      l.action,
      l.entity,
      l.user,
      l.severity
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowsync-audit-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Audit log exported successfully!', 'success');
  };

  const severityIcon = (s) => {
    switch (s) {
      case 'success': return <CheckCircle2 size={14} color="var(--emerald)" />;
      case 'warning': return <AlertTriangle size={14} color="var(--amber)" />;
      case 'info': return <Eye size={14} color="var(--accent)" />;
      default: return <Eye size={14} />;
    }
  };

  const tabs = [
    { key: 'audit', label: 'Audit & Compliance', icon: <Shield size={16} /> },
    { key: 'difflog', label: 'Field-Level Diffs', icon: <Database size={16} /> },
  ];

  const complianceChecks = [
    { label: 'SOC 2 Type II Compliant', status: 'passed', description: 'All controls verified. Last audit: March 2026.' },
    { label: 'Data Encryption at Rest', status: 'passed', description: 'AES-256 encryption on all stored credentials and sync data.' },
    { label: 'Data Encryption in Transit', status: 'passed', description: 'TLS 1.3 enforced on all API connections.' },
    { label: 'Access Control & RBAC', status: 'passed', description: 'Role-based access with admin, editor, and viewer roles.' },
    { label: 'Audit Log Retention', status: 'passed', description: '12-month retention policy. Exportable on demand.' },
    { label: 'GDPR Data Processing', status: 'review', description: 'DPA available on request. Processing agreements in place.' },
  ];

  const fieldDiffs = [
    { id: 'diff-1', field: 'company_name', oldValue: 'Acme Corp', newValue: 'Acme Corporation', source: 'HubSpot', timestamp: '2026-04-22T14:30:00Z', syncId: 'SYN-4021' },
    { id: 'diff-2', field: 'deal_value', oldValue: '$45,000', newValue: '$52,000', source: 'Salesforce', timestamp: '2026-04-22T14:28:00Z', syncId: 'SYN-4021' },
    { id: 'diff-3', field: 'contact_email', oldValue: 'john@acme.com', newValue: 'john.smith@acme.com', source: 'HubSpot', timestamp: '2026-04-22T10:15:00Z', syncId: 'SYN-4020' },
    { id: 'diff-4', field: 'phone', oldValue: '+1-555-0101', newValue: '+1-555-0199', source: 'QuickBooks', timestamp: '2026-04-21T16:45:00Z', syncId: 'SYN-4019' },
    { id: 'diff-5', field: 'deal_stage', oldValue: 'Negotiation', newValue: 'Closed Won', source: 'Salesforce', timestamp: '2026-04-21T11:20:00Z', syncId: 'SYN-4018' },
    { id: 'diff-6', field: 'CustomerName', oldValue: 'GlobalTech', newValue: 'GlobalTech Inc', source: 'QuickBooks', timestamp: '2026-04-20T09:10:00Z', syncId: 'SYN-4017' },
    { id: 'diff-7', field: 'Amount', oldValue: '$12,000', newValue: '$14,500', source: 'Xero', timestamp: '2026-04-20T08:55:00Z', syncId: 'SYN-4017' },
    { id: 'diff-8', field: 'NetValue', oldValue: '$125,000', newValue: '$130,000', source: 'SAP S/4HANA', timestamp: '2026-04-19T15:30:00Z', syncId: 'SYN-4016' },
  ];

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="fade-in"
    >
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SettingsIcon size={28} color="var(--accent)" /> Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Audit trails, compliance, and data governance.</p>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs" style={{ marginBottom: '28px' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Audit & Compliance Tab */}
      {activeTab === 'audit' && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* SOC2 Compliance Banner */}
          <motion.div variants={itemVariants} className="card" style={{ 
            marginBottom: '24px', 
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.08) 100%)',
            border: '1px solid rgba(16,185,129,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: 'rgba(16,185,129,0.15)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Shield size={28} color="var(--emerald)" />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    SOC 2 Type II Ready
                    <span className="badge badge-success">✓ Verified</span>
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    All security controls verified. Enterprise-grade audit trail for accounting compliance.
                  </p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm">
                <FileText size={14} /> View Certificate
              </button>
            </div>
          </motion.div>

          {/* Compliance Checks Grid */}
          <motion.div variants={itemVariants}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="var(--accent)" /> Compliance Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px', marginBottom: '32px' }}>
              {complianceChecks.map((check, i) => (
                <div key={i} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    background: check.status === 'passed' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {check.status === 'passed' 
                      ? <CheckCircle2 size={16} color="var(--emerald)" />
                      : <AlertTriangle size={16} color="var(--amber)" />
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{check.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{check.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Monthly Sync Logs Export */}
          <motion.div variants={itemVariants}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--accent)" /> Audit Log
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', minWidth: '180px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" className="form-input" placeholder="Search logs..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '34px', padding: '8px 12px 8px 34px', fontSize: '0.82rem' }}
                  />
                </div>
                <select 
                  className="form-select" 
                  value={filterSeverity}
                  onChange={e => setFilterSeverity(e.target.value)}
                  style={{ padding: '8px 32px 8px 12px', fontSize: '0.82rem', minWidth: '120px' }}
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                </select>
                <select 
                  className="form-select" 
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  style={{ padding: '8px 32px 8px 12px', fontSize: '0.82rem', minWidth: '140px' }}
                >
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <button className="btn btn-primary btn-sm" onClick={exportCSV}>
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity / Detail</th>
                    <th>User</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.slice(0, 15).map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 700 }}>{log.action}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{log.entity}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{log.user}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {severityIcon(log.severity)}
                          <span className={`badge badge-${log.severity === 'success' ? 'success' : log.severity === 'warning' ? 'warning' : 'info'}`}>
                            {log.severity}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Showing {Math.min(15, filteredLogs.length)} of {filteredLogs.length} entries · {selectedMonth}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Field-Level Diffs Tab */}
      {activeTab === 'difflog' && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="card" style={{ 
            marginBottom: '24px', padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.06) 100%)',
            border: '1px solid rgba(99,102,241,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Database size={20} color="var(--accent)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Field-Level Change Tracking</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Every field modification is logged with before/after values, source system, and sync batch ID.
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Field</th>
                    <th>Previous Value</th>
                    <th></th>
                    <th>New Value</th>
                    <th>Source</th>
                    <th>Sync ID</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldDiffs.map(diff => (
                    <tr key={diff.id}>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(diff.timestamp).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 700 }}>{diff.field}</td>
                      <td>
                        <span style={{ 
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.82rem',
                          background: 'rgba(244,63,94,0.08)', color: 'var(--rose)',
                          textDecoration: 'line-through'
                        }}>
                          {diff.oldValue}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', textAlign: 'center' }}>→</td>
                      <td>
                        <span style={{ 
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.82rem',
                          background: 'rgba(16,185,129,0.08)', color: 'var(--emerald)'
                        }}>
                          {diff.newValue}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{diff.source}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>{diff.syncId}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
