import { useState } from 'react';
import { useAuth } from '../AuthContext';

export default function AuthForm({ initialMessage }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(initialMessage || null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
        setInfo('Account created — you can log in now.');
        setMode('login');
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-box">
      <h2>{mode === 'login' ? 'Log In' : 'Create Account'}</h2>

      {info && <p className="status">{info}</p>}
      {error && <p className="status error">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Register'}
        </button>
      </form>

      <button
        className="btn-link"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setError(null);
          setInfo(null);
        }}
      >
        {mode === 'login' ? "Need an account? Register" : 'Already have an account? Log in'}
      </button>
    </div>
  );
}
