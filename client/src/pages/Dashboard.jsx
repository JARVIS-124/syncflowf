import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Zap, 
  CheckCircle2, 
  Activity, 
  Link as LinkIcon, 
  FileSpreadsheet, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  DollarSign,
  PiggyBank,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [connections, setConnections] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [recent, setRecent] = useState([]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [logsRes, connRes, dsRes] = await Promise.all([
        supabase.from('sync_logs').select('*').eq('user_id', user.id).order('started_at', { ascending: false }),
        supabase.from('connections').select('*').eq('user_id', user.id),
        supabase.from('data_sources').select('*').eq('user_id', user.id)
      ]);
      
      const logs = logsRes.data || [];
      const total = logs.length;
      const success = logs.filter(l => l.status === 'success').length;
      const connCount = (connRes.data || []).length;
      
      setStats({
          totalRecords: logs.reduce((a, c) => a + (c.records_success || 0), 0),
          currentMonthSyncs: total,
          syncLimit: 'Unlimited',
          successRate: total > 0 ? Math.round((success / total) * 100) : 0,
      });
      setRecent(logs.slice(0, 5));
      setConnections(connRes.data || []);
      
      const dsources = (dsRes.data || []).map(r => ({
          ...r,
          headers: JSON.parse(r.headers_json || '[]')
      }));
      setDataSources(dsources);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const statusColor = (s) => s === 'success' ? 'badge-success' : s === 'error' ? 'badge-error' : s === 'partial' ? 'badge-warning' : 'badge-info';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const formatCurrency = (val) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val}`;
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="dashboard-container"
    >
      <div className="page-header" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Welcome Back</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>System overview for your FlowSync integration</p>
      </div>

      {/* Bento Grid Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gridTemplateRows: 'repeat(2, auto)', 
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Main Stats Card (Bento 1) */}
        <motion.div variants={itemVariants} className="card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
            <Activity size={16} /> Live System Status
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div className="stat-value" style={{ fontSize: '4rem' }}>{stats?.successRate || 0}%</div>
            <div style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 700 }}>
              <TrendingUp size={16} /> Optimized
            </div>
          </div>
          <div className="stat-label" style={{ fontSize: '1rem' }}>Overall Synchronization Success Rate</div>
        </motion.div>

        {/* Empty space or additional info if needed */}

        {/* Small Stat Cards */}
        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-value">{stats?.totalRecords || 0}</div>
          <div className="stat-label">Records Synced</div>
        </motion.div>

        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Zap size={24} />
          </div>
          <div className="stat-value">
            {stats?.currentMonthSyncs !== undefined ? stats.currentMonthSyncs : (stats?.total || 0)}
            {stats?.syncLimit !== 'Unlimited' && stats?.syncLimit ? <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}> / {stats.syncLimit}</span> : null}
          </div>
          <div className="stat-label">Syncs This Month</div>
          {stats?.syncLimit !== 'Unlimited' && stats?.syncLimit && (
            <div style={{ marginTop: '8px', width: '100%', background: 'var(--bg-primary)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
               <div style={{ 
                 height: '100%', 
                 width: `${Math.min(100, (stats.currentMonthSyncs / stats.syncLimit) * 100)}%`, 
                 background: (stats.currentMonthSyncs / stats.syncLimit) > 0.9 ? 'var(--rose)' : 'var(--accent)'
               }}></div>
            </div>
          )}
        </motion.div>

        {/* Connections (Bento 4) */}
        <motion.div variants={itemVariants} className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LinkIcon size={20} color="var(--accent)" /> Active Connections
            </h3>
            <Link to="/app/connections" className="btn btn-sm btn-secondary">
              <ArrowUpRight size={14} /> View All
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {connections.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No connections yet.</p>
              </div>
            ) : (
              connections.slice(0, 3).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)' }}></div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.label || c.provider}</span>
                  <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Live</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Data Sources (Bento 5) */}
        <motion.div variants={itemVariants} className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileSpreadsheet size={20} color="var(--emerald)" /> Data Sources
            </h3>
            <Link to="/app/datasources" className="btn btn-sm btn-secondary">
              <ArrowUpRight size={14} /> Manage
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dataSources.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No files uploaded.</p>
              </div>
            ) : (
              dataSources.slice(0, 3).map(ds => (
                <div key={ds.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <FileSpreadsheet size={18} color="var(--text-muted)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ds.original_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{ds.row_count} rows · Updated recently</div>
                  </div>
                  <div className="badge badge-neutral">{ds.headers?.length || 0} cols</div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Syncs (Full Width Activity) */}
      <motion.div variants={itemVariants} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
             Recent Activity
          </h3>
          <Link to="/app/sync-logs" className="btn btn-sm btn-secondary">View Detail History</Link>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '16px' }}>
            <AlertCircle size={40} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No sync activity recorded yet.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Rule Name</th><th>Sync Status</th><th>Impact</th><th>Timestamp</th></tr></thead>
              <tbody>
                {recent.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 800, color: '#fff' }}>{log.rule_name || 'Manual Import'}</td>
                    <td>
                      <span className={`badge ${statusColor(log.status)}`} style={{ padding: '4px 12px' }}>
                        {log.status === 'success' && <CheckCircle2 size={12} style={{ marginRight: 6 }} />}
                        {log.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${(log.records_success / (log.records_processed || 1)) * 100}%`, height: '100%', background: 'var(--accent)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{log.records_success} records</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{log.started_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
