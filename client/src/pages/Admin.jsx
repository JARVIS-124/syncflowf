import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import ConfirmModal from '../components/ConfirmModal';
import { Navigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Settings, 
  CreditCard,
  ChevronDown,
  Check
} from 'lucide-react';

const CustomDropdown = ({ options, value, onChange, disabled, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', width: '130px' }}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '8px 12px', background: 'transparent', 
          border: '1px solid var(--border-subtle)', borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          color: 'var(--text-main)',
          transition: 'all 0.2s',
          ...(isOpen && { borderColor: 'var(--accent-indigo)', boxShadow: '0 0 0 1px var(--accent-indigo)' })
        }}
        className={className}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: className ? 'inherit' : 'var(--text-main)' }}>{selectedOption?.label || value}</span>
        <ChevronDown size={14} style={{ color: '#a1a1aa', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </div>
      
      {isOpen && !disabled && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '6px',
          background: '#18181b', border: '1px solid var(--border-subtle)',
          borderRadius: '8px', zIndex: 100, overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
        }}>
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{
                padding: '10px 12px', fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: opt.value === value ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: opt.value === value ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                transition: 'background 0.1s'
              }}
              onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontWeight: opt.value === value ? 600 : 500 }}>{opt.label}</span>
              {opt.value === value && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Admin() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [usersList, setUsersList] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  
  const fetchUsers = async () => {
    try {
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: true });
      if (data) setUsersList(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) return;
    fetchUsers();
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await supabase.from('users').update({ role: newRole }).eq('id', userId);
      fetchUsers();
      showNotification('User role updated', 'success');
    } catch (err) { showNotification(err.message, 'error'); }
  };

  const handlePlanChange = async (userId, newPlan) => {
    try {
      await supabase.from('users').update({ plan: newPlan }).eq('id', userId);
      fetchUsers();
      showNotification('User plan updated', 'success');
    } catch (err) { showNotification(err.message, 'error'); }
  };

  if (!user || !['admin', 'owner'].includes(user.role)) {
    return <Navigate to="/app/dashboard" />;
  }

  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [settings, setSettings] = useState({});

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*').limit(1).single();
      if (data) setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const toggleSubscription = async () => {
    const newVal = settings.subscriptions_enabled === 'false' ? 'true' : 'false';
    try {
      const { error } = await supabase.from('settings').upsert([{ 
        id: settings.id || 'global_settings', 
        subscriptions_enabled: newVal 
      }]);
      
      if (error) throw error;
      
      fetchSettings();
      showNotification(`Subscriptions ${newVal === 'true' ? 'enabled' : 'disabled'}`, 'info');
    } catch (err) {
      showNotification('Failed to update settings: ' + err.message, 'error');
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await supabase.from('plans').select('*');
      if (data) {
        setPlans(data.map(p => ({
           ...p,
           features: typeof p.features_json === 'string' ? JSON.parse(p.features_json || '[]') : (p.features_json || [])
        })));
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  };

  useEffect(() => {
    if (!user || !['admin', 'owner'].includes(user.role)) return;
    fetchPlans();
    fetchSettings();
  }, [user]);

  const savePlan = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('plans').update({
          name: editingPlan.name,
          price: editingPlan.price,
          description: editingPlan.description,
          features_json: JSON.stringify(editingPlan.features.split('\n').filter(Boolean)),
          is_popular: editingPlan.is_popular
      }).eq('id', editingPlan.id);
      setEditingPlan(null);
      fetchPlans();
      showNotification('Plan settings saved', 'success');
    } catch(err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div style={{ padding: '2rem', flex: 1, backgroundColor: 'var(--bg-main)', minHeight: '100vh', overflowY: 'auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <ShieldCheck size={32} style={{ color: 'var(--accent-indigo)' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Dashboard</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Users size={24} style={{ color: 'var(--accent-indigo)' }} />
            <span style={{ fontWeight: 600, color: '#a1a1aa' }}>Total Users</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{usersList.length}</div>
          <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem' }}>Since launch</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <CreditCard size={24} style={{ color: '#f59e0b' }} />
            <span style={{ fontWeight: 600, color: '#a1a1aa' }}>Active Subscriptions</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            {usersList.filter(u => u.plan !== 'Free').length}
          </div>
          <div style={{ color: '#71717a', fontSize: '0.875rem', marginTop: '0.5rem' }}>Paid plans</div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Activity size={24} style={{ color: '#10b981' }} />
            <span style={{ fontWeight: 600, color: '#a1a1aa' }}>System Status</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>Healthy</div>
          <div style={{ color: '#71717a', fontSize: '0.875rem', marginTop: '0.5rem' }}>All services operational</div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Settings size={24} style={{ color: 'var(--accent-indigo)' }} />
              <span style={{ fontWeight: 600, color: '#a1a1aa' }}>System Settings</span>
            </div>
            <button 
              className={`btn ${settings.subscriptions_enabled === 'false' ? 'btn-secondary' : 'btn-primary'}`} 
              onClick={toggleSubscription}
            >
              {settings.subscriptions_enabled === 'false' ? 'Enable Subscriptions' : 'Disable Subscriptions'}
            </button>
          </div>
          <div style={{ color: '#71717a', fontSize: '0.875rem' }}>
            {settings.subscriptions_enabled === 'false' ? 'Users cannot purchase or upgrade subscriptions.' : 'Users can purchase and manage subscriptions.'}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>User Management</h2>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#a1a1aa' }}>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Joined Date</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Plan</th>
              <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((usr) => (
              <tr key={usr.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{usr.name}</td>
                <td style={{ padding: '1rem' }}>{usr.email}</td>
                <td style={{ padding: '1rem' }}>{new Date(usr.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>
                  <CustomDropdown 
                    className={usr.role === 'admin' ? 'role-admin' : usr.role === 'owner' ? 'role-owner' : ''}
                    value={usr.role || 'user'} 
                    onChange={(newVal) => handleRoleChange(usr.id, newVal)}
                    disabled={usr.role === 'owner' && user.role !== 'owner'}
                    options={[
                      { value: 'user', label: 'User' },
                      { value: 'admin', label: 'Admin' },
                      ...(user.role === 'owner' || usr.role === 'owner' ? [{ value: 'owner', label: 'Owner' }] : [])
                    ]}
                  />
                </td>
                <td style={{ padding: '1rem' }}>
                  <CustomDropdown 
                    value={usr.plan || plans[0]?.name || 'Free'} 
                    onChange={(newVal) => handlePlanChange(usr.id, newVal)}
                    disabled={usr.role === 'owner' && user.role !== 'owner'}
                    options={plans.map(p => ({ value: p.name, label: p.name }))}
                  />
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {usr.role !== 'owner' && (
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ color: '#ef4444', borderColor: '#ef4444', backgroundColor: 'transparent' }}
                      onClick={async () => {
                        setConfirmAction({
                          title: 'Remove User',
                          message: `Are you sure you want to permanently remove user ${usr.email}? This cannot be undone.`,
                          onConfirm: async () => {
                            setConfirmAction(null);
                            try {
                              await supabase.from('users').delete().eq('id', usr.id);
                              fetchUsers();
                              showNotification('User removed', 'info');
                            } catch (err) {
                               showNotification(err.message, 'error');
                            }
                          }
                        });
                      }}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {usersList.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#a1a1aa' }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Landing Page Plans</h2>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#a1a1aa' }}>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Plan Name</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Price</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Active Users</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{plan.name}</td>
                <td style={{ padding: '1rem' }}>{plan.price}</td>
                <td style={{ padding: '1rem' }}>{usersList.filter(u => u.plan === plan.name).length}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    Active
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingPlan({...plan, features: (plan.features || []).join('\n')})}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingPlan && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit Plan: {editingPlan.name}</h2>
            <form onSubmit={savePlan}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Name</label>
                <input required value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Price</label>
                <input required value={editingPlan.price} onChange={e => setEditingPlan({...editingPlan, price: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                <input required value={editingPlan.description} onChange={e => setEditingPlan({...editingPlan, description: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Features (One per line)</label>
                <textarea required rows={5} value={editingPlan.features} onChange={e => setEditingPlan({...editingPlan, features: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'white', resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={editingPlan.is_popular ? true : false} onChange={e => setEditingPlan({...editingPlan, is_popular: e.target.checked ? 1 : 0})} id="isPopular" />
                <label htmlFor="isPopular" style={{ fontWeight: 600 }}>Mark as Most Popular</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingPlan(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
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
