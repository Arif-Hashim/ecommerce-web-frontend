import { Link } from 'react-router-dom';

export const Loader = ({ text = 'Loading…' }) => <div className="state"><span className="spinner" />{text}</div>;

export const ErrorBox = ({ message }) => (
  <div className="state err">
    <strong>{message || 'Something went wrong.'}</strong>
    <span className="muted">Check that the backend is running on the address in your .env file, then refresh.</span>
  </div>
);

export const Empty = ({ title, text, to, cta }) => (
  <div className="state">
    <h3>{title}</h3>
    {text && <p className="muted">{text}</p>}
    {to && <Link to={to} className="btn">{cta}</Link>}
  </div>
);
