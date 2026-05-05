import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import ConfirmModal from '../components/ConfirmModal';

export default function Subscription() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [currentPlan, setCurrentPlan] = useState('');
  const [plans, setPlans] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  
  useEffect(() => {
    if (user?.plan) {
      setCurrentPlan(user.plan);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [planData, settingsData] = await Promise.all([
          supabase.from('plans').select('*').order('price', { ascending: true }),
          supabase.from('settings').select('*').limit(1).single()
        ]);
        const loadedPlans = (planData.data || []).map(p => ({
           ...p,
           features: typeof p.features_json === 'string' ? JSON.parse(p.features_json || '[]') : (p.features_json || [])
        }));
        setPlans(loadedPlans);
        setSettings(settingsData.data || { id: 'global_settings', subscriptions_enabled: 'true' });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for real-time setting changes
    const channel = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, payload => {
        if (payload.new) setSettings(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpgrade = async (planName) => {
    if (settings.subscriptions_enabled === 'false') {
      showNotification('Subscriptions are currently disabled by the administrator.', 'error');
      return;
    }
    if (planName === currentPlan) return;
    setConfirmAction({
      title: 'Change Plan',
      message: `Are you sure you want to change your plan to ${planName}?`,
      type: 'info',
      onConfirm: async () => {
        setConfirmAction(null);
        if (user) {
          try {
            await supabase.from('users').update({ plan: planName }).eq('id', user.id);
            setCurrentPlan(planName);
            showNotification(`Successfully subscribed to ${planName}!`, 'success');
          } catch (err) {
            showNotification(err.message, 'error');
          }
        }
      }
    });
  };

  if (loading) {
    return <div style={{ padding: '2rem', flex: 1, backgroundColor: 'var(--bg-main)' }}>Loading plans...</div>;
  }

  return (
    <div style={{ padding: '2rem', flex: 1, backgroundColor: 'var(--bg-main)', minHeight: '100vh', overflowY: 'auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <CreditCard size={32} style={{ color: 'var(--accent-indigo)' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Subscription & Billing</h1>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Current Plan: <span style={{ color: 'var(--accent-indigo)' }}>{currentPlan}</span></h2>
            <p style={{ color: '#71717a' }}>User: {user?.email}</p>
          </div>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', 
            padding: '8px 16px', borderRadius: '8px', fontWeight: 600 
          }}>
            <Check size={18} /> Active
          </div>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>Manage Your Plan</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.name;
            return (
              <div 
                key={plan.id}
                style={{ 
                  background: 'var(--bg-card)', 
                  padding: '2rem', 
                  borderRadius: '12px', 
                  border: isCurrent || plan.is_popular ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)', 
                  position: 'relative', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxShadow: isCurrent || plan.is_popular ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'none' 
                }}
              >
                {plan.is_popular && (
                  <div style={{ position: 'absolute', top: '-12px', right: '2rem', background: 'var(--accent-indigo)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={12} /> Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{plan.name}</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0' }}>{plan.price}</div>
                <p style={{ color: '#71717a', marginBottom: '1.5rem' }}>{plan.description}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1 }}>
                  {plan.features.map((feature, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Check size={16} className={plan.is_popular ? "text-indigo-400" : ""} /> {feature}
                    </div>
                  ))}
                </div>
                
                  <button
                    className={`btn ${isCurrent || settings.subscriptions_enabled === 'false' ? 'btn-secondary' : 'btn-primary'}`}
                    disabled={isCurrent || settings.subscriptions_enabled === 'false'}
                    onClick={() => handleUpgrade(plan.name)}
                    style={{ width: '100%', opacity: isCurrent || settings.subscriptions_enabled === 'false' ? 0.5 : 1, cursor: isCurrent || settings.subscriptions_enabled === 'false' ? 'not-allowed' : 'pointer' }}
                  >
                    {isCurrent ? 'Current Plan' : settings.subscriptions_enabled === 'false' ? 'Disabled' : `Select ${plan.name}`}
                  </button>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
        type={confirmAction?.type || 'danger'}
        confirmText="Confirm Change"
      />
    </div>
  );
}
