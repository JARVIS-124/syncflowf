import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
              minWidth: '300px',
              animation: 'slideIn 0.3s ease-out',
              color: '#fff'
            }}
          >
            <div style={{ color: n.type === 'success' ? '#10b981' : n.type === 'error' ? '#ef4444' : '#6366f1' }}>
              {n.type === 'success' ? <CheckCircle2 size={20} /> : n.type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />}
            </div>
            <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{n.message}</div>
            <button
              onClick={() => removeNotification(n.id)}
              style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be inside NotificationProvider');
  return ctx;
}
