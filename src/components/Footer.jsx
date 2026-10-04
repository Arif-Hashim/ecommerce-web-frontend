import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <div className="logo">SHOP.CO</div>
          <p className="muted small">Clothes that fit your taste and your everyday life.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop">All products</Link>
          <Link to="/shop?sort=newest">New arrivals</Link>
          <Link to="/shop/gym">Gym</Link>
          <Link to="/shop/party">Party</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/orders">My orders</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
      <div className="wrap footer-base muted small">SHOP.CO © 2026. Built as an academy project.</div>
    </footer>
  );
}
