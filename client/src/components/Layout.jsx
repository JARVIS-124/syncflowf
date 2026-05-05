import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Link as LinkIcon, 
  FileSpreadsheet, 
  Settings2, 
  Zap, 
  History, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  BookTemplate,
  Store,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

const baseNavItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
  { to: '/app/connections', label: 'Connections', icon: <LinkIcon /> },
  { to: '/app/datasources', label: 'Data Sources', icon: <FileSpreadsheet /> },
  { to: '/app/mapper', label: 'Field Mapper', icon: <Settings2 /> },
  { to: '/app/sync-rules', label: 'Sync Rules', icon: <Zap /> },
  { to: '/app/sync-logs', label: 'Sync Logs', icon: <History /> },
  { to: '/app/templates', label: 'Templates', icon: <BookTemplate /> },
  { to: '/app/marketplace', label: 'Marketplace', icon: <Store /> },
  { to: '/app/subscription', label: 'Subscription', icon: <CreditCard /> },
  { to: '/app/settings', label: 'Settings', icon: <Settings /> },
  { to: '/app/support', label: 'Support', icon: <MessageSquare /> },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  
  const navItems = [...baseNavItems];
  if (user?.role === 'admin' || user?.role === 'owner') {
    navItems.push({ to: '/app/admin', label: 'Admin', icon: <ShieldCheck /> });
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ 
            width: '32px', height: '32px', background: 'var(--gradient)', 
            borderRadius: '8px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' 
          }}>
            <Zap size={20} color="white" />
          </div>
          <span className="logo-text">FlowSync</span>
        </div>
        
        <nav className="sidebar-nav">
          <div style={{ padding: '0 16px', marginBottom: '12px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Main Menu
          </div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              <ChevronRight size={14} className="chevron" style={{ opacity: 0, transition: 'opacity 0.2s' }} />
            </NavLink>
          ))}
        </nav>

        {/* Desktop Footer (Hidden on mobile) */}
        <div className="sidebar-footer" id="desktop-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              <motion.span whileHover={{ scale: 1.1 }}>
                {(user?.name || 'U')[0].toUpperCase()}
              </motion.span>
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="mobile-header" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--gradient)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>FlowSync</span>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><LogOut size={20} /></button>
      </div>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
