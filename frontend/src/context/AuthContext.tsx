import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface AuthCtx { 
  user: any; 
  token: string | null; 
}

export const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    const session = supabase.auth.getSession();
    if ('data' in session && session.data?.session) {
      setUser(session.data.session.user);
      setToken(session.data.session.access_token);
    }
    
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setToken(session?.access_token ?? null);
    });
    
    return () => listener.subscription.unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, token }}>
      {children}
    </AuthContext.Provider>
  );
};