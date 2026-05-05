import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Zap } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(email, password, name);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Blurs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '10%', right: '-10%', width: '40%', height: '40%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          filter: 'blur(100px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '-10%', width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(120px)'
        }} />
      </div>

      <motion.div 
        className="auth-card" 
        style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '48px', height: '48px', background: 'var(--gradient)', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto 20px',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <Zap size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>Create an account</h1>
          <p className="auth-subtitle">Start syncing your data across platforms in minutes</p>
        </div>

        {error && <motion.div className="form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="John Doe" 
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="you@company.com" 
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Min 6 characters" 
                required 
                minLength={6}
              />
            </div>
          </div>
          <button className="btn btn-primary btn-large" type="submit" disabled={loading} style={{ width: '100%', marginTop: '12px' }}>
            {loading ? <span className="spinner"></span> : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Get Started <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
