import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Zap, 
  ArrowRight, 
  Database, 
  Layers, 
  Shield, 
  RefreshCw, 
  MousePointer2,
  FileSpreadsheet,
  Network,
  Share2,
  Globe,
  Check,
  Cpu,
  Server,
  Code2,
  Lock,
  Clock,
  Layout,
  AlertTriangle,
  Heart
} from 'lucide-react';
import './Landing.css';

const FLOW_STEPS = [
  {
    id: 'connect',
    title: 'Connect Anything',
    desc: 'Link your HubSpot, QuickBooks, or custom Excel data sources in seconds with secure API integration.',
    color: '#6366f1'
  },
  {
    id: 'map',
    title: 'Visual Mapping',
    desc: 'Drag and drop fields to define exactly how data transforms between platforms without writing code.',
    color: '#a855f7'
  },
  {
    id: 'sync',
    title: 'Automated Sync',
    desc: 'Set triggers and watch as your data flows seamlessly across your entire business ecosystem.',
    color: '#06b6d4'
  }
];

export default function Landing() {
  const [activeTab, setActiveTab] = useState(0);
  const [plans, setPlans] = useState([]);
  const [settings, setSettings] = useState({ subscriptions_enabled: 'true' });

  useEffect(() => {
    Promise.all([
      supabase.from('plans').select('*').order('price', { ascending: true }),
      supabase.from('settings').select('*').limit(1).single()
    ]).then(([planRes, settingsRes]) => {
      if (!planRes.error && planRes.data) {
        setPlans(planRes.data.map(p => ({
          ...p,
          features: typeof p.features_json === 'string' ? JSON.parse(p.features_json || '[]') : (p.features_json || [])
        })));
      }
      if (!settingsRes.error && settingsRes.data) {
        setSettings(settingsRes.data);
      }
    }).catch(e => console.error(e));
  }, []);

  // Auto-rotate tabs for the showcase
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % FLOW_STEPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-bg" />

      {/* Header */}
      <motion.header 
        className="landing-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="landing-header-inner">
          <div className="landing-logo">
            <Zap fill="#6366f1" size={24} style={{ color: '#6366f1' }} />
            <span>SyncFlow</span>
          </div>
          <nav className="landing-nav" style={{ display: 'flex' }}>
            <a href="#features">Features</a>
            <a href="#approaches">Approaches</a>
            <a href="#tech-stack">Tech</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-badge"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ✨ Now with Live HubSpot Integration
        </motion.div>
        
        <motion.h1 
          className="hero-title"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          The Future of Unified <span>Data Flow</span>
        </motion.h1>

        <motion.p 
          className="hero-desc"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Seamlessly synchronize real-time data between Excel, CRM, and Invoicing platforms with a visual, high-performance engine.
        </motion.p>

        <motion.div 
          className="cta-group"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/signup" className="btn btn-primary">
            Start Syncing For Free <ArrowRight size={18} />
          </Link>
          <button className="btn btn-secondary">
            Watch Demo
          </button>
        </motion.div>
      </section>

      {/* Interactive Showcase Section */}
      <section id="how-it-works" className="showcase-section">
        <motion.div 
          className="showcase-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 variants={itemVariants}>Build Your Ecosystem</motion.h2>
          <motion.p variants={itemVariants}>Three simple steps to automate your entire business stack.</motion.p>
        </motion.div>

        <div className="flow-showcase">
          <div className="flow-tabs">
            {FLOW_STEPS.map((step, idx) => (
              <div 
                key={step.id} 
                className={`flow-tab ${activeTab === idx ? 'active' : ''}`}
                onClick={() => setActiveTab(idx)}
              >
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
                {activeTab === idx && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="tab-indicator-bar"
                    style={{ backgroundColor: step.color }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flow-visual">
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div 
                  key="v-connect"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '24px' }}
                >
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="demo-icon-box">
                      <FileSpreadsheet size={48} style={{ color: '#10b981' }} />
                    </div>
                    <div className="demo-icon-box">
                      <Network size={48} style={{ color: '#6366f1' }} />
                    </div>
                    <div className="demo-icon-box">
                      <Database size={48} style={{ color: '#f59e0b' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scanning Providers...</p>
                    <div className="progress-track">
                      <motion.div 
                        animate={{ x: [-200, 200] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="progress-thumb"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 1 && (
                <motion.div 
                  key="v-map"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div className="source-label">Source: QuickBooks</div>
                    <ArrowRight style={{ color: '#3f3f46' }} size={16} />
                    <div className="source-label">Dest: HubSpot</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="field-skeleton" />
                        <motion.div 
                          animate={{ width: [0, 80] }}
                          className="field-connector"
                        />
                        <div className="field-skeleton highlight" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {activeTab === 2 && (
                <motion.div 
                  key="v-sync"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      style={{ width: '128px', height: '128px', border: '2px dashed rgba(6, 182, 212, 0.2)', borderRadius: '50%' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RefreshCw size={40} style={{ color: '#22d3ee' }} className="spinner" />
                    </div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0], y: [-20, -60] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', color: '#22d3ee', fontSize: '10px', fontWeight: 'bold' }}
                    >
                      SYNCING 241 RECORDS...
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Integration Approaches */}
      <section id="approaches" className="section-full">
        <div className="max-width-container">
          <div className="section-header">
            <span className="section-label">Integration Approaches</span>
            <h2 className="section-title">Key Methods for <span className="gradient-text">Seamless Data Flow</span></h2>
            <p className="section-desc">Proven strategies for connecting your Excel, CRM, and invoicing ecosystems.</p>
          </div>
          <div className="approaches-grid">
            <motion.div className="approach-card" variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className="approach-number">01</div>
              <div className="approach-icon api-icon"><Network size={24} /></div>
              <h3>Native APIs</h3>
              <p>Direct sync between modern CRMs and invoicing tools. Data flows instantly when a deal closes.</p>
              <div className="approach-tags">
                <span className="tag">Salesforce</span><span className="tag">HubSpot</span><span className="tag">Xero</span>
              </div>
            </motion.div>
            <motion.div className="approach-card" variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="approach-number">02</div>
              <div className="approach-icon mw-icon"><RefreshCw size={24} /></div>
              <h3>Middleware iPaaS</h3>
              <p>Zapier or Make act as translators. Automated customer creation without writing a single line of code.</p>
              <div className="approach-tags">
                <span className="tag">Zapier</span><span className="tag">Make</span><span className="tag">n8n</span>
              </div>
            </motion.div>
            <motion.div className="approach-card" variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="approach-number">03</div>
              <div className="approach-icon excel-icon"><FileSpreadsheet size={24} /></div>
              <h3>Excel as a Hub</h3>
              <p>Power Query pulls live data into spreadsheets while Power Automate pushes it back to your apps.</p>
              <div className="approach-tags">
                <span className="tag">Power Query</span><span className="tag">Excel Online</span>
              </div>
            </motion.div>
            <motion.div className="approach-card" variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <div className="approach-number">04</div>
              <div className="approach-icon db-icon"><Database size={24} /></div>
              <h3>Data Warehouse</h3>
              <p>Centralized truth in PostgreSQL or BigQuery for high-volume synchronization and deep reporting.</p>
              <div className="approach-tags">
                <span className="tag">Postgres</span><span className="tag">BigQuery</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="section-full" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-width-container">
          <div className="section-header">
            <span className="section-label">Architecture</span>
            <h2 className="section-title">Design <span className="gradient-text">Principles</span></h2>
            <p className="section-desc">Foundational rules for reliable, conflict-free data integrations.</p>
          </div>
          <div className="principles-grid">
            {[
              { icon: <Shield />, title: 'Single Ownership', desc: 'One system owns each data type. CRM owns contacts, invoicing owns payments.' },
              { icon: <Clock />, title: 'Event-Driven Sync', desc: 'Sync on events, not schedules. Real-time updates beats batch processing.' },
              { icon: <Layout />, title: 'Explicit Mapping', desc: "Define fields clearly. CRM 'Name' ≠ Invoicing 'Client' without a map." },
              { icon: <Layers />, title: 'Full Audit Trail', desc: 'Log every operation. Debug instantly when data or duplicates appear.' }
            ].map((p, i) => (
              <motion.div key={i} className="principle-card" variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="principle-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="section-full">
        <div className="max-width-container">
          <div className="problem-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <span className="section-label">The Opportunity</span>
              <h2 className="section-title">The Core Problem <br/><span className="gradient-text">We Solve</span></h2>
              <p className="section-desc" style={{ marginBottom: '24px' }}>
                Existing solutions are either too generic, too expensive, or require deep technical setup.
              </p>
              <div style={{ padding: '20px', background: 'rgba(99,102,241,0.05)', borderLeft: '4px solid #6366f1', borderRadius: '4px', marginBottom: '40px' }}>
                <p style={{ fontStyle: 'italic', color: '#a1a1aa' }}>
                  SyncFlow is purpose-built for the specific trio: <strong>Excel × CRM × Invoicing</strong>.
                </p>
              </div>
              <div className="problem-stats">
                <div className="stat-item">
                  <span className="stat-value">73%</span>
                  <span className="stat-label">Businesses with disconnected tools</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">40hr</span>
                  <span className="stat-label">Manual entry wasted per month</span>
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <AlertTriangle className="text-amber-500" />
                  <div>
                    <h4 style={{ fontWeight: 800 }}>Broken Workflows</h4>
                    <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Manual data entry creates version drift and expensive errors.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <Zap className="text-indigo-500" />
                  <div>
                    <h4 style={{ fontWeight: 800 }}>Scalability Limits</h4>
                    <p style={{ color: '#71717a', fontSize: '0.9rem' }}>Generic tools get bogged down by API rate limits and complex mapping.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech-stack" className="section-full" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-width-container">
          <div className="section-header">
            <span className="section-label">Engineering</span>
            <h2 className="section-title">Built to <span className="gradient-text">Scale</span></h2>
            <p className="section-desc">Foundation for reliability, performance, and data integrity.</p>
          </div>
          <div className="tech-grid">
            {[
              { cat: 'Backend', icon: <Cpu />, badges: ['Node.js', 'Express'], desc: 'Robust API handling and service orchestration.' },
              { cat: 'Queue', icon: <Clock />, badges: ['Redis', 'Bull'], desc: 'Throttled background sync with auto-retries.' },
              { cat: 'Database', icon: <Database />, badges: ['Postgres'], desc: 'ACID-compliant storage for every mapping logic.' }
            ].map((t, i) => (
              <motion.div key={i} className="tech-card" variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', fontWeight: 700 }}>{t.cat}</span>
                  <div style={{ color: '#3f3f46' }}>{t.icon}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {t.badges.map(b => <span key={b} className="tech-badge">{b}</span>)}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#71717a' }}>{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-full">
        <div className="max-width-container">
          <div className="section-header">
            <span className="section-label">Monetization</span>
            <h2 className="section-title">Simple <span className="gradient-text">Pricing</span></h2>
          </div>
          <div className="pricing-grid">
            {plans.map(p => (
              <div key={p.id} className={`pricing-card ${p.is_popular ? 'featured' : ''}`}>
                {p.is_popular ? (
                  <span className="section-label" style={{ color: '#fff', background: 'var(--accent-indigo)', padding: '2px 8px', borderRadius: '4px' }}>Most Popular</span>
                ) : (
                  <span className="section-label">{p.name}</span>
                )}
                <div className="price-amount">{p.price}</div>
                <p style={{ color: '#71717a', fontSize: '0.9rem', margin: '12px 0 32px' }}>{p.description}</p>
                <div className="pricing-features">
                  {p.features.map((f, i) => (
                    <div key={i} className="feature-item"><Check size={14} className="feature-check"/> {f}</div>
                  ))}
                </div>
                  <Link 
                    to={p.name === 'Free' || settings.subscriptions_enabled === 'true' ? "/signup" : "#"} 
                    className={`btn ${p.is_popular ? 'btn-primary' : 'btn-secondary'}`} 
                    style={{ 
                      marginTop: 'auto',
                      opacity: p.name !== 'Free' && settings.subscriptions_enabled === 'false' ? 0.5 : 1,
                      cursor: p.name !== 'Free' && settings.subscriptions_enabled === 'false' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {p.name !== 'Free' && settings.subscriptions_enabled === 'false' ? 'Subscriptions Paused' : 'Get Started'}
                  </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risks transparency */}
      <section className="section-full" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-width-container">
          <div className="section-header">
            <span className="section-label">Transparency</span>
            <h2 className="section-title">Risks & <span className="gradient-text">Mitigation</span></h2>
          </div>
          <div className="risks-grid">
            <div className="risk-card">
              <span className="risk-severity severity-high">High Impact</span>
              <h4 style={{ fontWeight: 800, marginBottom: '8px' }}>API Rate Limits</h4>
              <p style={{ fontSize: '0.85rem', color: '#71717a' }}>CRMs enforce strict limits. We implement exponential backoff and rate-aware scheduling.</p>
            </div>
            <div className="risk-card" style={{ borderLeftColor: 'var(--accent-amber)' }}>
              <span className="risk-severity severity-medium">Medium Impact</span>
              <h4 style={{ fontWeight: 800, marginBottom: '8px' }}>Mapping Complexity</h4>
              <p style={{ fontSize: '0.85rem', color: '#71717a' }}>Businesses name fields differently. Our visual mapper keeps every field aligned.</p>
            </div>
            <div className="risk-card">
              <span className="risk-severity severity-high">High Impact</span>
              <h4 style={{ fontWeight: 800, marginBottom: '8px' }}>API Maintenance</h4>
              <p style={{ fontSize: '0.85rem', color: '#71717a' }}>External APIs change. We maintain an abstraction layer that handles breaking changes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-width-1200" style={{ margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '32px' }}>Ready to unify your business?</h2>
          <Link to="/signup" className="btn btn-primary">
            Get Started For Free
          </Link>
          <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '32px', color: '#52525b' }}>
            <Share2 size={20} />
            <Globe size={20} />
          </div>
          <p style={{ marginTop: '32px', fontSize: '0.75rem', color: '#27272a' }}>© 2026 SyncFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
