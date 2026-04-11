import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, name, password);
      }
      navigate('/campaigns');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Campaign Manager</h1>
        <p className="auth-sub">{mode === 'login' ? 'Sign in to your account' : 'Create an account'}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>Don't have an account? <button className="link-btn" onClick={() => setMode('register')}>Register</button></>
          ) : (
            <>Already have an account? <button className="link-btn" onClick={() => setMode('login')}>Sign In</button></>
          )}
        </p>

        <div className="auth-demo">
          <p className="demo-hint">Demo credentials:</p>
          <code>demo@example.com / password123</code>
        </div>
      </div>
    </div>
  );
}
