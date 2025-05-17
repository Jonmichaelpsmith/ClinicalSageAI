import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '@fluentui/react-components';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleLogin = async () => {
    setErrorMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data) {
      nav('/dashboard');
    } else if (error) {
      setErrorMsg(error.message || 'Login failed');
    }
  };
  
  return (
    <div style={{ maxWidth: 320, margin: '10% auto' }}>
      <h2>TrialSage Login</h2>
      <Input
        placeholder="Email"
        value={email}
        onChange={(_, v) => {
          setEmail(v.value);
          if (errorMsg) setErrorMsg('');
        }}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(_, v) => {
          setPassword(v.value);
          if (errorMsg) setErrorMsg('');
        }}
      />
      {errorMsg && (
        <div
          style={{
            padding: '8px 12px',
            marginTop: 12,
            marginBottom: 12,
            backgroundColor: '#FFF1F0',
            color: '#CF1124',
            borderRadius: 4,
          }}
        >
          {errorMsg}
        </div>
      )}
      <Button appearance="primary" onClick={handleLogin} style={{ marginTop: 16 }}>Login</Button>
    </div>
  );
}