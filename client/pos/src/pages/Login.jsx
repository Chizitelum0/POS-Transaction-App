import { useState } from 'react';

export default function Login({ onLogin, loading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">POS</div>
        <p className="eyebrow">Secure terminal access</p>
        <h1>Welcome back</h1>
        <p className="login-copy">Sign in to continue to your point-of-sale workspace.</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit}>
          <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" autoComplete="username" required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" required /></label>
          <button className="primary full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  );
}
