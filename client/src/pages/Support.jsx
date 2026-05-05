import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, Plus, CheckCircle, Clock } from 'lucide-react';

export default function Support() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // Admin reply inputs
  const [replyText, setReplyText] = useState({});

  const fetchTickets = async () => {
    if (!user) return;
    try {
      let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }
      const { data } = await query;
      
      if (data) {
        setTickets(data.map(t => ({
           ...t,
           replies: JSON.parse(t.replies_json || '[]')
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('tickets').insert([{
        id: crypto.randomUUID(),
        user_id: user.id,
        user_email: user?.email || 'user@example.com',
        subject,
        message,
        status: 'open',
        replies_json: JSON.stringify([])
      }]);
      setSubject('');
      setMessage('');
      fetchTickets();
      showNotification('Ticket submitted successfully!', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleAdminReplyAndStatus = async (ticketId, selectedStatus) => {
    try {
      const resp = replyText[ticketId] || '';
      const ticket = tickets.find(t => t.id === ticketId);
      let newReplies = [...(ticket?.replies || [])];
      
      if (resp) {
         newReplies.push({
            id: crypto.randomUUID(),
            role: 'admin',
            message: resp,
            created_at: new Date().toISOString()
         });
      }
      
      await supabase.from('tickets').update({
        status: selectedStatus,
        replies_json: JSON.stringify(newReplies)
      }).eq('id', ticketId);
      
      setReplyText(prev => ({ ...prev, [ticketId]: '' }));
      fetchTickets();
      showNotification('Status updated', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleUserReply = async (ticketId) => {
    try {
      const resp = replyText[ticketId] || '';
      if (!resp) return;

      const ticket = tickets.find(t => t.id === ticketId);
      let newReplies = [...(ticket?.replies || [])];
      
      newReplies.push({
         id: crypto.randomUUID(),
         role: 'user',
         message: resp,
         created_at: new Date().toISOString()
      });

      await supabase.from('tickets').update({
        replies_json: JSON.stringify(newReplies)
      }).eq('id', ticketId);
      
      setReplyText(prev => ({ ...prev, [ticketId]: '' }));
      fetchTickets();
      showNotification('Reply sent', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const updateReplyText = (id, val) => {
    setReplyText(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div style={{ padding: '2rem', flex: 1, backgroundColor: 'var(--bg-main)', minHeight: '100vh', overflowY: 'auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <MessageSquare size={32} style={{ color: 'var(--accent-indigo)' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Support Tickets</h1>
        </div>
        {user?.role !== 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> New Ticket
          </button>
        )}
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create New Ticket</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Subject</label>
            <input 
              type="text" 
              required
              className="input-field" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              placeholder="E.g., Connection failing" 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Message</label>
            <textarea 
              required
              className="input-field" 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              rows={4}
              placeholder="Describe your issue..." 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">Submit Ticket</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            No support tickets found.
          </div>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {ticket.subject}
                    <span style={{ 
                      fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '12px', 
                      background: ticket.status === 'open' ? 'rgba(245, 158, 11, 0.1)' : 
                                  ticket.status === 'closed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                      color: ticket.status === 'open' ? '#f59e0b' : 
                             ticket.status === 'closed' ? '#10b981' : '#8b5cf6',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      {ticket.status === 'open' ? <Clock size={12} /> : 
                       ticket.status === 'closed' ? <CheckCircle size={12} /> : <MessageSquare size={12} />}
                      {ticket.status.toUpperCase()}
                    </span>
                  </h3>
                  {user?.role === 'admin' && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      From: {ticket.user_email}
                    </div>
                  )}
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {new Date(ticket.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                {ticket.message}
              </div>

              {ticket.replies && ticket.replies.map(reply => (
                <div key={reply.id} style={{ 
                  padding: '1rem', 
                  background: reply.role === 'admin' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-input)', 
                  borderLeft: reply.role === 'admin' ? '4px solid var(--accent-indigo)' : '4px solid var(--border-subtle)', 
                  borderRadius: '0 8px 8px 0', 
                  color: 'var(--text-primary)',
                  marginTop: '0.5rem'
                }}>
                  <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: reply.role === 'admin' ? 'var(--accent-indigo)' : 'var(--text-secondary)' }}>
                    {reply.role === 'admin' ? 'Admin Reply' : 'User Reply'} • {new Date(reply.created_at).toLocaleString()}
                  </strong>
                  {reply.message}
                </div>
              ))}

              {ticket.status !== 'closed' && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <textarea
                    placeholder={user?.role === 'admin' ? "Type your admin reply here..." : "Type your reply here..."}
                    className="input-field"
                    value={replyText[ticket.id] || ''}
                    onChange={(e) => updateReplyText(ticket.id, e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-input)', color: 'var(--text-primary)', marginBottom: '1rem' }}
                    rows={3}
                  />
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {user?.role === 'admin' ? (
                      <>
                        <button className="btn btn-primary" onClick={() => handleAdminReplyAndStatus(ticket.id, 'closed')}>
                          Reply & Close
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleAdminReplyAndStatus(ticket.id, 'reviewing')}>
                          Mark as Reviewing
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleAdminReplyAndStatus(ticket.id, 'reviewed')}>
                          Mark as Reviewed
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-primary" onClick={() => handleUserReply(ticket.id)}>
                        Send Reply
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
