import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CartIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from './Icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');

  const go = (to) => { setOpen(false); setMenu(false); navigate(to); };
  const submit = (e) => {
    e.preventDefault();
    go(q.trim() ? `/shop?search=${encodeURIComponent(q.trim())}` : '/shop');
    setQ('');
  };

  return (
    <>
      <div className="announce">
        Sign up and get 20% off your first order with code <strong>SAVE20</strong>.{' '}
        {!user && <Link to="/register"><u>Sign up now</u></Link>}
      </div>
      <header className="header">
        <div className="wrap header-in">
          <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
          <Link to="/" className="logo" onClick={() => setOpen(false)}>SHOP.CO</Link>

          <nav className={`nav ${open ? 'open' : ''}`}>
            <NavLink to="/shop" end onClick={() => setOpen(false)}>Shop</NavLink>
            <NavLink to="/shop?sort=newest" onClick={() => setOpen(false)}>New arrivals</NavLink>
            <NavLink to="/shop?sort=rating" onClick={() => setOpen(false)}>Top rated</NavLink>
            <NavLink to="/shop/casual" onClick={() => setOpen(false)}>Casual</NavLink>
            <NavLink to="/shop/formal" onClick={() => setOpen(false)}>Formal</NavLink>
          </nav>

          <form className="search" onSubmit={submit} role="search">
            <SearchIcon width={20} height={20} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for products" aria-label="Search products" />
          </form>

          <div className="icons">
            <Link to="/cart" className="icon-btn" aria-label={`Cart, ${itemCount} items`}>
              <CartIcon />
              {itemCount > 0 && <span className="badge">{itemCount}</span>}
            </Link>
            <div className="user-menu">
              <button className="icon-btn" onClick={() => setMenu(!menu)} aria-label="Account menu"><UserIcon /></button>
              {menu && (
                <div className="dropdown" onMouseLeave={() => setMenu(false)}>
                  {user ? (
                    <>
                      <div className="dd-head">Hi, {user.name.split(' ')[0]}</div>
                      <button onClick={() => go('/orders')}>My orders</button>
                      <button onClick={() => go('/profile')}>Profile</button>
                      {isAdmin && <button onClick={() => go('/admin')}>Admin panel</button>}
                      <button onClick={() => { logout(); go('/'); }}>Log out</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => go('/login')}>Log in</button>
                      <button onClick={() => go('/register')}>Create account</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
