import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, MapPin, Users, Star, Send, X,
  BadgeCheck, Building2, Search, ExternalLink
} from 'lucide-react';
import { VERTICALS } from '../lib/demoProvider';
import { useNotification } from '../context/NotificationContext';

const PARTNERS = [
  {
    id: 'p-1',
    name: 'HubSpot Elite Partners',
    specialty: 'CRM Integration Expert',
    vertical: 'accounting',
    location: 'Remote / Global',
    clients: 1250,
    rating: 4.9,
    certified: true,
    description: 'Specialists in HubSpot Private App integrations. We help you connect HubSpot Contacts and Deals to your financial backend using SyncFlow.',
    services: ['HubSpot API Setup', 'Custom CRM Properties', 'Deal Stage Mapping', 'Private App Security'],
    logo: '🧡',
    color: '#ff7a59',
  },
  {
    id: 'p-2',
    name: 'Salesforce Architects',
    specialty: 'Enterprise Cloud Integrator',
    vertical: 'erp_crm',
    location: 'San Francisco, CA',
    clients: 840,
    rating: 4.8,
    certified: true,
    description: 'Expert Salesforce consultants focusing on account and contact synchronization. verified SyncFlow implementation partners.',
    services: ['SFDC Object Mapping', 'Account Sync', 'Multi-Org Setup', 'Apex Trigger Logic'],
    logo: '☁️',
    color: '#00a1e0',
  },
  {
    id: 'p-3',
    name: 'QuickBooks Pro Advisors',
    specialty: 'Financial Automators',
    vertical: 'accounting',
    location: 'Chicago, IL',
    clients: 2100,
    rating: 4.9,
    certified: true,
    description: 'Helping businesses automate their invoicing by connecting CRM data directly to QuickBooks Online and Desktop.',
    services: ['QuickBooks API Connect', 'Invoice Automation', 'Tax Code Sync', 'Customer Record Linkage'],
    logo: '💚',
    color: '#2ca01c',
  },
  {
    id: 'p-4',
    name: 'ERP Bridge Solutions',
    specialty: 'SAP & NetSuite Experts',
    vertical: 'erp_crm',
    location: 'Austin, TX',
    clients: 430,
    rating: 4.7,
    certified: true,
    description: 'Specialized in bridging the gap between legacy SAP S/4HANA systems and modern cloud CRM platforms.',
    services: ['SAP Data Extraction', 'NetSuite Entity Sync', 'ERP Workflow Design', 'High-Volume Data Pipes'],
    logo: '🔶',
    color: '#f59e0b',
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

export default function Marketplace() {
  const { showNotification } = useNotification();
  const [vertical, setVertical] = useState('all');
  const [search, setSearch] = useState('');
  const [contact, setContact] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });

  const filtered = PARTNERS.filter(p => {
    const matchVertical = vertical === 'all' || p.vertical === vertical;
    const matchSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.specialty.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    return matchVertical && matchSearch;
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    showNotification(`Message sent to ${contact.name}! They'll respond within 24 hours.`, 'success');
    setContact(null);
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="fade-in"
    >
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Store size={28} color="var(--accent)" /> Partner Marketplace
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Certified integration partners specialized in the platforms you use.</p>
      </div>

      {/* Vertical Filter + Search */}
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
            placeholder="Search partners..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {/* Partners Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {filtered.map(partner => (
          <motion.div key={partner.id} variants={itemVariants} className="card partner-card">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '14px', 
                background: `${partner.color}15`, 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', flexShrink: 0
              }}>
                {partner.logo}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{partner.name}</h3>
                  {partner.certified && (
                    <BadgeCheck size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge ${partner.vertical === 'accounting' ? 'badge-accounting' : 'badge-erp'}`}>
                    {partner.vertical === 'accounting' ? '🏦 Accounting' : '🔶 ERP+CRM'}
                  </span>
                  <span className="badge badge-neutral">{partner.specialty}</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
              {partner.description}
            </p>

            {/* Stats */}
            <div className="partner-stats">
              <div className="partner-stat">
                <MapPin size={13} color="var(--text-muted)" />
                <span>{partner.location}</span>
              </div>
              <div className="partner-stat">
                <Users size={13} color="var(--accent)" />
                <span>{partner.clients} clients</span>
              </div>
              <div className="partner-stat">
                <Star size={13} fill="var(--amber)" color="var(--amber)" />
                <span>{partner.rating}</span>
              </div>
            </div>

            {/* Services */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {partner.services.map((s, i) => (
                <span key={i} style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  {s}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setContact(partner)} style={{ flex: 1 }}>
                <Send size={14} /> Contact Partner
              </button>
              <button className="btn btn-secondary btn-sm" style={{ flex: 0 }}>
                <ExternalLink size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Building2 size={48} />
          <h3>No partners found</h3>
          <p>Try adjusting your search or vertical filter.</p>
        </div>
      )}

      {/* Contact Partner Modal */}
      <AnimatePresence>
        {contact && (
          <motion.div 
            className="modal-backdrop" 
            onClick={() => setContact(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal" 
              onClick={e => e.stopPropagation()} 
              style={{ maxWidth: 560, padding: '36px' }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button className="modal-close" onClick={() => setContact(null)}>
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ 
                  width: '52px', height: '52px', borderRadius: '14px', 
                  background: `${contact.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {contact.logo}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Contact {contact.name}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{contact.specialty} · {contact.location}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.06)', borderRadius: '10px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{contact.clients}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active Clients</div>
                </div>
                <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.06)', borderRadius: '10px', flex: 1, textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Star size={14} fill="var(--amber)" color="var(--amber)" /> {contact.rating}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rating</div>
                </div>
              </div>

              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input 
                    type="text" required className="form-input"
                    value={formData.name} 
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} 
                    placeholder="John Smith"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" required className="form-input"
                    value={formData.email} 
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} 
                    placeholder="john@company.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input 
                    type="text" required className="form-input"
                    value={formData.company} 
                    onChange={e => setFormData(f => ({ ...f, company: e.target.value }))} 
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea 
                    required className="form-input" rows={4}
                    value={formData.message} 
                    onChange={e => setFormData(f => ({ ...f, message: e.target.value }))} 
                    placeholder="Tell them about your integration needs..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setContact(null)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                    <Send size={16} /> Send Message
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
