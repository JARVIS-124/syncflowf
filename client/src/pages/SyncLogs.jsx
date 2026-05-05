import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function SyncLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState(null);

  const load = async () => {
    if (!user) return;
    try {
      const limit = 15;
      const start = (page - 1) * limit;
      let query = supabase.from('sync_logs').select('*', { count: 'exact' }).eq('user_id', user.id).order('started_at', { ascending: false });
      if (filter) query = query.eq('status', filter);
      
      const { data, count } = await query.range(start, start + limit - 1);
      if (data) {
        setLogs(data);
        setPages(Math.ceil((count || 0) / limit));
      }
    } catch {}
  };

  useEffect(() => { load(); }, [page, filter, user]);
  
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data } = await supabase.from('sync_logs').select('*').eq('user_id', user.id);
      if (data) {
        const total = data.length;
        const success = data.filter(d => d.status === 'success').length;
        const errors = data.filter(d => d.status === 'error' || d.records_failed > 0).length;
        setStats({
           total, success, errors,
           successRate: total > 0 ? Math.round((success / total) * 100) : 0
        });
      }
    };
    fetchStats();
  }, [user]);

  const viewDetail = async (id) => {
    try {
      const log = logs.find(l => l.id === id);
      if (!log) return;
      
      setDetail({
         log,
         entries: [
            { timestamp: new Date().toISOString(), level: 'info', message: `Started execution for rule ${log.rule_name || 'unknown'}` },
            { timestamp: new Date().toISOString(), level: 'info', message: `Processed ${log.records_processed} records.` },
            { timestamp: new Date().toISOString(), level: 'info', message: `Success: ${log.records_success}, Failed: ${log.records_failed}.` }
         ]
      });
    } catch {}
  };

  const statusBadge = (s) => {
    const map = { success: 'badge-success', error: 'badge-error', partial: 'badge-warning', running: 'badge-info', completed: 'badge-neutral' };
    return map[s] || 'badge-neutral';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Sync Logs</h1>
        <p>Full audit trail of every sync operation</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="card-grid card-grid-sm" style={{ marginBottom: 24 }}>
          <div className="card stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Syncs</div></div>
          <div className="card stat-card"><div className="stat-value">{stats.success}</div><div className="stat-label">Successful</div></div>
          <div className="card stat-card"><div className="stat-value">{stats.errors}</div><div className="stat-label">Errors</div></div>
          <div className="card stat-card"><div className="stat-value">{stats.successRate}%</div><div className="stat-label">Success Rate</div></div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['', 'success', 'error', 'partial'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setFilter(f); setPage(1); }}>
            {f || 'All'}
          </button>
        ))}
      </div>

      {/* Log Table */}
      {logs.length === 0 ? (
        <div className="empty-state">
          <h3>No sync logs {filter ? `with status "${filter}"` : 'yet'}</h3>
          <p>Run a sync from the Sync Rules page to see activity here.</p>
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr><th>Rule</th><th>Status</th><th>Records</th><th>Success</th><th>Failed</th><th>Started</th><th></th></tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{log.rule_name || '—'}</td>
                  <td><span className={`badge ${statusBadge(log.status)}`}>{log.status}</span></td>
                  <td>{log.records_processed}</td>
                  <td style={{ color: 'var(--emerald)' }}>{log.records_success}</td>
                  <td style={{ color: log.records_failed > 0 ? 'var(--rose)' : 'inherit' }}>{log.records_failed}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.started_at}</td>
                  <td><button className="btn btn-sm btn-secondary" onClick={() => viewDetail(log.id)}>Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
              <span style={{ padding: '6px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {page} of {pages}</span>
              <button className="btn btn-sm btn-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <h2>Sync Log — {detail.log.rule_name || 'Unknown'}</h2>
              <button className="modal-close" onClick={() => setDetail(null)}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{detail.log.records_processed}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Processed</div>
              </div>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--emerald)' }}>{detail.log.records_success}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Success</div>
              </div>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--rose)' }}>{detail.log.records_failed}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Failed</div>
              </div>
              <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                <span className={`badge ${statusBadge(detail.log.status)}`} style={{ fontSize: '0.8rem' }}>{detail.log.status}</span>
              </div>
            </div>

            {detail.log.error_message && (
              <div className="form-error" style={{ marginBottom: 16 }}>{detail.log.error_message}</div>
            )}

            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 10 }}>Execution Log</h3>
            <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 12, maxHeight: 400, overflowY: 'auto' }}>
              {detail.entries.map((entry, i) => (
                <div key={i} className={`log-entry-row ${entry.level}`}>
                  <span className="log-entry-time">{entry.timestamp?.split(' ')[1] || ''}</span>
                  <span className="log-entry-level">{entry.level}</span>
                  <span className="log-entry-msg">{entry.message}</span>
                </div>
              ))}
            </div>

            {/* Show transformed data if available in entries */}
            {detail.entries.some(e => e.data?.sampleOutput) && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 10 }}>Output Data Sample</h3>
                <div style={{ overflowX: 'auto' }}>
                  {detail.entries.filter(e => e.data?.sampleOutput).map((entry, i) => (
                    <table key={i} className="data-table">
                      <thead><tr>{entry.data.sampleOutput[0] && Object.keys(entry.data.sampleOutput[0]).map(k => <th key={k}>{k}</th>)}</tr></thead>
                      <tbody>
                        {entry.data.sampleOutput.map((row, j) => (
                          <tr key={j}>{Object.values(row).map((v, k) => <td key={k}>{String(v)}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  ))}
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Total: {detail.entries.find(e => e.data?.totalRecords)?.data.totalRecords || '?'} records
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
