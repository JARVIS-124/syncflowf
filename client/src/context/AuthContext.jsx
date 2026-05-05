import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser) => {
    try {
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      // If user doesn't exist in public.users table, create the row
      // This fixes FK constraint errors when auth user exists but profile row doesn't
      if (!data || error) {
        const { data: inserted, error: insertErr } = await supabase
          .from('users')
          .upsert([{
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            role: 'user',
            plan: 'Free'
          }], { onConflict: 'id' })
          .select()
          .single();
        
        if (inserted) {
          data = inserted;
        }
      }
      
      if (data) {
        setUser({ ...authUser, ...data });
      } else {
        setUser(authUser);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUser(authUser);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return data;
  };

  const signup = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    
    // Insert profile data into our public users table
    if (data.user) {
      await supabase.from('users').insert([{
        id: data.user.id,
        email: email,
        name: name,
        role: 'user',
        plan: 'Free'
      }]);
    }
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Deprecated placeholders to prevent components from crashing before they are fully migrated
  const apiFetch = async () => { throw new Error('apiFetch is deprecated in Supabase Native mode'); };
  const apiJson = async () => { throw new Error('apiJson is deprecated. Use supabase.from() in components'); };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, apiFetch, apiJson }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
