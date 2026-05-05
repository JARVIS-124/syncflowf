import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import { getAllProviders, getProviderInfo, getProviderFields, getProviderSampleData, VERTICALS } from '../lib/demoProvider';
import ConfirmModal from '../components/ConfirmModal';
import { fetchRealProviderData } from '../lib/integrations';

const PROVIDER_META = {
  hubspot: { color: '#ff7a59', letter: 'H', label: 'HubSpot CRM' },
  salesforce: { color: '#00a1e0', letter: 'S', label: 'Salesforce' },
  quickbooks: { color: '#2ca01c', letter: 'Q', label: 'QuickBooks' },
  xero: { color: '#13b5ea', letter: 'X', label: 'Xero' },
  sap: { color: '#0f6fec', letter: 'S', label: 'SAP S/4HANA' },
  netsuite: { color: '#1a7cb7', letter: 'N', label: 'NetSuite' },
  dynamics: { color: '#002050', letter: 'D', label: 'MS Dynamics 365' },
};

export default function Connections() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [connections, setConnections] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeConnModal, setActiveConnModal] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [vertical, setVertical] = useState('all');

  const load = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const parsedConns = data.map(r => {
          const creds = r.credentials_json ? JSON.parse(r.credentials_json) : {};
          return {
            ...r,
            fields: r.fields_json ? JSON.parse(r.fields_json) : [],
            hasRealCredentials: Object.keys(creds).length > 0
          };
        });
        setConnections(parsedConns);
      }
      setProviders(getAllProviders());
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const connect = async (provider, providerApiKey = '') => {
    if (!user) return;
    setConnecting(provider);
    try {
      const info = getProviderInfo(provider);
      const fields = getProviderFields(provider);
      let sample = getProviderSampleData(provider);
      
      const creds = providerApiKey ? { apiKey: providerApiKey } : {};

      // Try to fetch real data if API key is provided
      if (providerApiKey) {
        try {
          const realData = await fetchRealProviderData(provider, providerApiKey);
          if (realData && realData.length > 0) {
            sample = realData;
          }
        } catch (fetchErr) {
          console.warn(`Could not fetch real ${provider} data, falling back to demo:`, fetchErr);
          showNotification(`Using demo data for ${info.label}. (Real API Error: ${fetchErr.message})`, 'warning');
        }
      }

      const { data, error } = await supabase.from('connections').insert([{
        id: crypto.randomUUID(),
        user_id: user.id,
        provider: provider,
        label: info.label,
        status: 'connected',
        credentials_json: JSON.stringify(creds),
        fields_json: JSON.stringify(fields),
        sample_data_json: JSON.stringify(sample)
      }]);
      
      if (error) {
         if (error.code === '23505') throw new Error(`Already connected to ${info.label}`);
         throw error;
      }
      
      setActiveConnModal(null);
      setApiKey('');
      await load();
      showNotification(`Connected to ${info.label}! ${providerApiKey ? '(Live Data)' : '(Demo Data)'}`, 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to connect', 'error');
    } finally { setConnecting(null); }
  };

  const disconnect = async (id) => {
    setConfirmAction({
      title: 'Disconnect Service',
      message: 'Are you sure you want to disconnect this service? This will remove all associated connection details.',
      onConfirm: async () => {
        setConfirmAction(null);
        try {
          await supabase.from('connections').delete().eq('id', id);
          setPreview(null);
          await load();
          showNotification('Service disconnected', 'info');
        } catch {
          showNotification('Failed to disconnect', 'error');
        }
      }
    });
  };

  const viewData = async (id) => {
    try {
      const conn = connections.find(c => c.id === id);
      if (!conn) return;
      const data = conn.sample_data_json ? JSON.parse(conn.sample_data_json) : [];
      setPreview({ label: conn.label, provider: conn.provider, data });
    } catch {}
  };

  const filteredProviders = vertical === 'all' 
    ? providers 
    : providers.filter(p => p.vertical === vertical);

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ width: 32, height: 32 }}></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Connections</h1>
        <p>Connect your CRM, ERP, and invoicing services. Demo mode provides realistic sample data.</p>
      </div>

      {/* Vertical Filter */}
      <div className="vertical-filter" style={{ marginBottom: '24px' }}>
        {VERTICALS.map(v => (
          <button
            key={v.key}
            className={`vertical-pill ${vertical === v.key ? 'active' : ''}`}
            onClick={() => setVertical(v.key)}
          >
            <span>{v.icon}</span> {v.label}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {filteredProviders.map(p => {
          const meta = PROVIDER_META[p.key] || { color: '#6366f1', letter: '?', label: p.label };
          const conn = connections.find(c => c.provider === p.key);
          const isConnected = !!conn;

          return (
            <div key={p.key} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${meta.color}20`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                  {meta.letter}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{meta.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`badge ${p.vertical === 'accounting' ? 'badge-accounting' : 'badge-erp'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                      {p.vertical === 'accounting' ? '🏦' : '🔶'}
                    </span>
                    {p.type === 'crm' ? 'CRM' : p.type === 'erp' ? 'ERP' : 'Invoicing'} · {p.fieldCount} fields · {p.recordCount} records
                  </div>
                </div>
              </div>

              {isConnected ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="badge badge-success" style={{ marginRight: 'auto' }}>
                    <span className="status-dot active"></span> {conn.hasRealCredentials ? 'Live Connection' : 'Demo Connected'}
                  </span>
                  <button className="btn btn-sm btn-secondary" onClick={() => viewData(conn.id)}>View Data</button>
                  <button className="btn btn-sm btn-danger" onClick={() => disconnect(conn.id)}>Disconnect</button>
                </div>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => { setActiveConnModal(p.key); setApiKey(''); }} disabled={connecting === p.key} style={{ width: '100%' }}>
                  {connecting === p.key ? <span className="spinner"></span> : `Connect ${meta.label}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Credential Modal */}
      {activeConnModal && (
          <div className="modal-backdrop" onClick={() => setActiveConnModal(null)} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, padding: '32px 40px', backgroundColor: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '16px' }}>
              <button className="modal-close" onClick={() => setActiveConnModal(null)} style={{ color: '#fff' }}>×</button>
              <div className="modal-header" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#fff' }}>Connect {(PROVIDER_META[activeConnModal] || {}).label}</h2>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '1.1rem', fontWeight: 600, whiteSpace: 'nowrap', color: '#fff' }}>
                  API Key / Access Token
                </label>
                <input
                  type="text"
                  placeholder="Enter your API Key..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  style={{ flex: 1, backgroundColor: '#18181b', color: '#fff', borderRadius: '6px', padding: '12px 14px', border: '1px solid #3f3f46', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)', outline: 'none' }}
                />
              </div>
              
              <p style={{ fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '2.5rem', lineHeight: 1.5 }}>
                Leave blank to use demo data. Providing a real key will fetch live data!
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveConnModal(null)}
                  style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 600, border: '1px solid #27272a', color: '#fff', backgroundColor: 'transparent' }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => connect(activeConnModal, apiKey)}
                  disabled={connecting === activeConnModal}
                  style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 600, flex: 1, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', color: '#fff', border: 'none' }}
                >
                  {connecting === activeConnModal ? 'Connecting...' : 'Save Connection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Preview Modal */}
      {preview && (
        <div className="modal-backdrop" onClick={() => setPreview(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="modal-header">
              <h2>{preview.label} — Sample Data ({preview.data.length} records)</h2>
              <button className="modal-close" onClick={() => setPreview(null)}>×</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr>{preview.data[0] && Object.keys(preview.data[0]).map(k => <th key={k}>{k}</th>)}</tr></thead>
                <tbody>
                  {preview.data.map((row, i) => (
                    <tr key={i}>{Object.values(row).map((v, j) => <td key={j}>{String(v)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
        type={confirmAction?.type || 'danger'}
      />
    </div>
  );
}
