import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '@fluentui/react-components';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data) nav('/dashboard');
    // TODO: handle error UI
  };
  
  return (
    <div style={{ maxWidth: 320, margin: '10% auto' }}>
      <h2>TrialSage Login</h2>
      <Input placeholder="Email" value={email} onChange={(_, v) => setEmail(v.value)} />
      <Input type="password" placeholder="Password" value={password} onChange={(_, v) => setPassword(v.value)} />
      <Button appearance="primary" onClick={handleLogin} style={{ marginTop: 16 }}>Login</Button>
    </div>
  );
}