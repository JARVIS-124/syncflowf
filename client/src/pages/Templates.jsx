import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookTemplate, Star, Download, Shield, Eye, X,
  ArrowRight, CheckCircle2, Zap, Search, Filter
} from 'lucide-react';
import { VERTICALS } from '../lib/demoProvider';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'HubSpot to QuickBooks Sync',
    description: 'Sync real-time HubSpot contact and deal data to QuickBooks customers. Optimized for automated client onboarding.',
    source: 'HubSpot',
    destination: 'QuickBooks',
    vertical: 'accounting',
    installs: 2847,
    rating: 4.9,
    certified: true,
    category: 'Client Management',
    mappings: [
      { source: 'company_name', dest: 'CustomerName', transform: 'Direct Map' },
      { source: 'contact_email', dest: 'Email', transform: 'Direct Map' },
      { source: 'deal_value', dest: 'Amount', transform: 'Currency Format' },
      { source: 'deal_stage', dest: 'Status', transform: 'Stage → Status Lookup' },
      { source: 'phone', dest: 'Phone', transform: 'Format +1-XXX' },
    ]
  },
  {
    id: 'tpl-2',
    name: 'SAP Order to Xero Invoice',
    description: 'Convert SAP S/4HANA sales orders into Xero contacts and invoices automatically. Supports multi-entity mapping.',
    source: 'SAP S/4HANA',
    destination: 'Xero',
    vertical: 'erp_crm',
    installs: 1523,
    rating: 4.8,
    certified: true,
    category: 'Order Management',
    mappings: [
      { source: 'SalesOrder', dest: 'Reference', transform: 'Prefix INV-' },
      { source: 'NetValue', dest: 'Total', transform: 'Currency Convert' },
      { source: 'CustomerCode', dest: 'ContactName', transform: 'Customer Lookup' },
      { source: 'Material', dest: 'LineItem.Description', transform: 'Direct Map' },
      { source: 'Quantity', dest: 'LineItem.Quantity', transform: 'Direct Map' },
    ]
  },
  {
    id: 'tpl-3',
    name: 'Salesforce to HubSpot Link',
    description: 'Bidirectional sync between Salesforce accounts and HubSpot CRM properties. Keeps sales and marketing data in sync.',
    source: 'Salesforce',
    destination: 'HubSpot',
    vertical: 'erp_crm',
    installs: 3201,
    rating: 4.7,
    certified: true,
    category: 'Sales Pipeline',
    mappings: [
      { source: 'Account_Name', dest: 'company_name', transform: 'Direct Map' },
      { source: 'Email', dest: 'contact_email', transform: 'Direct Map' },
      { source: 'Contact_First', dest: 'contact_name', transform: 'Combine with Last' },
    ]
  },
  {
    id: 'tpl-4',
    name: 'Xero to HubSpot Payments',
    description: 'Track invoice payment status from Xero inside your HubSpot deals. Automatic stage updates on payment receipt.',
    source: 'Xero',
    destination: 'HubSpot',
    vertical: 'accounting',
    installs: 1892,
    rating: 4.6,
    certified: false,
    category: 'Finance',
    mappings: [
      { source: 'ContactName', dest: 'company_name', transform: 'Fuzzy Match' },
      { source: 'Total', dest: 'deal_value', transform: 'Direct Map' },
      { source: 'Reference', dest: 'notes', transform: 'Append Ref#' },
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Templates() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [vertical, setVertical] = useState('all');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null);
  const [installing, setInstalling] = useState(null);

  const installTemplate = async (tpl) => {
    if (!user) return showNotification('Please log in to install templates', 'error');
    setInstalling(tpl.id);
    
    try {
      const mappingId = crypto.randomUUID();
      const { error: mErr } = await supabase.from('field_mappings').insert([{
        id: mappingId,
        user_id: user.id,
        name: `${tpl.name} Mapping`,
        source_type: tpl.source.toLowerCase(),
        dest_type: tpl.destination.toLowerCase(),
        mappings_json: JSON.stringify(tpl.mappings)
      }]);

      if (mErr) throw mErr;

      const { error: rErr } = await supabase.from('sync_rules').insert([{
        id: crypto.randomUUID(),
        user_id: user.id,
        name: tpl.name,
        trigger_type: 'manual',
        action_type: 'sync_contacts',
        mapping_id: mappingId,
        enabled: true
      }]);

      if (rErr) throw rErr;

      showNotification(`Successfully installed ${tpl.name}! Check your Sync Rules page.`, 'success');
    } catch (err) {
      showNotification('Installation failed: ' + err.message, 'error');
    } finally {
      setInstalling(null);
    }
  };

  const filtered = TEMPLATES.filter(t => {
    const matchVertical = vertical === 'all' || t.vertical === vertical;
    const matchSearch = !search || 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.source.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase());
    return matchVertical && matchSearch;
  });

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="fade-in"
    >
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BookTemplate size={28} color="var(--accent)" /> Workflow Templates
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Pre-built, audited connectors ready to deploy. Built for the systems you use.</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="vertical-filter">
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
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {filtered.map(tpl => (
          <motion.div key={tpl.id} variants={itemVariants} className="card template-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge ${tpl.vertical === 'accounting' ? 'badge-accounting' : 'badge-erp'}`}>
                    {tpl.vertical === 'accounting' ? '🏦 Accounting' : '🔶 ERP+CRM'}
                  </span>
                  {tpl.certified && (
                    <span className="badge badge-certified">
                      <Shield size={10} /> Audited
                    </span>
                  )}
                  <span className="badge badge-neutral">{tpl.category}</span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '6px' }}>{tpl.name}</h3>
              </div>
            </div>

            <div className="template-flow">
              <div className="template-flow-node source">{tpl.source}</div>
              <ArrowRight size={16} color="var(--text-muted)" />
              <div className="template-flow-node dest">{tpl.destination}</div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px', minHeight: '44px' }}>
              {tpl.description}
            </p>

            <div className="template-stats">
              <div className="template-stat">
                <Download size={13} />
                <span>{tpl.installs.toLocaleString()}</span>
              </div>
              <div className="template-stat">
                <Star size={13} fill="var(--amber)" color="var(--amber)" />
                <span>{tpl.rating}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPreview(tpl)} style={{ flex: 1 }}>
                <Eye size={14} /> Preview Mappings
              </button>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => installTemplate(tpl)} 
                disabled={installing === tpl.id}
                style={{ flex: 1 }}
              >
                {installing === tpl.id ? <span className="spinner"></span> : <><Zap size={14} /> Install Template</>}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Filter size={48} />
          <h3>No templates found</h3>
          <p>Try adjusting your search or vertical filter.</p>
        </div>
      )}

      <AnimatePresence>
        {preview && (
          <motion.div 
            className="modal-backdrop" 
            onClick={() => setPreview(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: 720, padding: '36px' }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button className="modal-close" onClick={() => setPreview(null)}>
                <X size={18} />
              </button>

              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span className={`badge ${preview.vertical === 'accounting' ? 'badge-accounting' : 'badge-erp'}`}>
                    {preview.vertical === 'accounting' ? '🏦 Accounting' : '🔶 ERP+CRM'}
                  </span>
                  {preview.certified && (
                    <span className="badge badge-certified">
                      <Shield size={10} /> Audit Certified
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em' }}>{preview.name}</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.6 }}>{preview.description}</p>
              </div>

              <div className="template-flow" style={{ marginBottom: '24px', justifyContent: 'center' }}>
                <div className="template-flow-node source" style={{ padding: '12px 24px', fontSize: '1rem' }}>{preview.source}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <ArrowRight size={20} color="var(--accent)" />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{preview.mappings.length} FIELDS</span>
                </div>
                <div className="template-flow-node dest" style={{ padding: '12px 24px', fontSize: '1rem' }}>{preview.destination}</div>
              </div>

              <div className="template-stats" style={{ marginBottom: '24px', justifyContent: 'center', gap: '32px' }}>
                <div className="template-stat">
                  <Download size={14} /> {preview.installs.toLocaleString()} installs
                </div>
                <div className="template-stat">
                  <Star size={14} fill="var(--amber)" color="var(--amber)" /> {preview.rating} rating
                </div>
              </div>

              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Field Mapping Details
              </h3>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Source Field</th>
                      <th>Transform</th>
                      <th>Destination Field</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.mappings.map((m, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: '#fff' }}>{m.source}</td>
                        <td><span className="badge badge-info" style={{ fontSize: '0.68rem' }}>{m.transform}</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--emerald)' }}>{m.dest}</td>
                        <td><CheckCircle2 size={16} color="var(--emerald)" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={() => setPreview(null)} style={{ flex: 1 }}>Close</button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 2 }}
                  onClick={() => {
                    installTemplate(preview);
                    setPreview(null);
                  }}
                >
                  <Zap size={16} /> Install This Template
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
