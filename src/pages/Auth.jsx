import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state || {}).from;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      if (isLogin) await login(email, password); else await register(name, email, password);
      navigate(from ? `${from.pathname}${from.search || ''}` : '/', { replace: true, state: from ? from.state : undefined });
    } catch (ex) { setErr(ex.message); setBusy(false); }
  };

  return (
    <div className="wrap auth">
      <form className="card-box form" onSubmit={submit}>
        <h1 className="h-md">{isLogin ? 'Log in' : 'Create your account'}</h1>
        {!isLogin && <label>Full name<input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>}
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label>Password<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isLogin ? 'current-password' : 'new-password'} /></label>
        {!isLogin && <p className="muted small">Use at least 6 characters.</p>}
        {err && <p className="err-text">{err}</p>}
        <button className="btn block" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
        <p className="muted small center-t">
          {isLogin ? <>New here? <Link to="/register" state={{ from }}><u>Create an account</u></Link></> : <>Already have an account? <Link to="/login" state={{ from }}><u>Log in</u></Link></>}
        </p>
      </form>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
