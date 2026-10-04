import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CloseIcon, MenuIcon } from '../../components/Icons';

export default function AdminLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const item = (to, label, end) => <NavLink to={to} end={end} onClick={() => setOpen(false)}>{label}</NavLink>;
  return (
    <div className="admin">
      <aside className={`a-side ${open ? 'open' : ''}`}>
        <Link to="/" className="logo">SHOP.CO</Link>
        <p className="muted small">Admin panel</p>
        <nav>
          {item('/admin', 'Dashboard', true)}
          {item('/admin/products', 'Products')}
          {item('/admin/orders', 'Orders')}
          {item('/admin/users', 'Users')}
        </nav>
        <Link to="/" className="back muted small">← Back to store</Link>
      </aside>
      <div className="a-main">
        <div className="a-top">
          <button className="icon-btn a-menu" onClick={() => setOpen(!open)} aria-label="Toggle admin menu">{open ? <CloseIcon /> : <MenuIcon />}</button>
          <span className="muted small">Signed in as {user.email}</span>
        </div>
        <div className="a-body"><Outlet /></div>
      </div>
    </div>
  );
}
