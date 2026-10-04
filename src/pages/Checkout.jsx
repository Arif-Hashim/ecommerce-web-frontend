import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { couponsApi, ordersApi } from '../api';
import { imgUrl } from '../api/client';
import { useMeta } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Empty } from '../components/State';
import { money } from '../utils';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, subtotal, clearCart } = useCart();
  const meta = useMeta();
  const navigate = useNavigate();
  const couponCode = (useLocation().state || {}).couponCode || '';
  const a = user.address || {};
  const [form, setForm] = useState({ fullName: user.name || '', phone: user.phone || '', street: a.street || '', city: a.city || '', postalCode: a.postalCode || '', country: a.country || '' });
  const [discount, setDiscount] = useState(0);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!couponCode || subtotal <= 0) { setDiscount(0); return; }
    couponsApi.validate(couponCode, subtotal).then((r) => setDiscount(r.discount)).catch(() => setDiscount(0));
  }, [couponCode, subtotal]);

  if (cart.length === 0 && !saving) {
    return <div className="wrap"><Empty title="Nothing to check out" text="Your cart is empty." to="/shop" cta="Browse products" /></div>;
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const fee = meta.deliveryFee;
  const total = subtotal - discount + fee;

  const submit = async (e) => {
    e.preventDefault();
    setErr(null); setSaving(true);
    try {
      const order = await ordersApi.create({ shippingAddress: form, paymentMethod: 'cod', couponCode: discount > 0 ? couponCode : undefined });
      await clearCart();
      navigate(`/orders/${order.id}`, { replace: true, state: { placed: true } });
    } catch (ex) { setErr(ex.message); setSaving(false); }
  };

  return (
    <div className="wrap cart-page">
      <h1 className="h-lg">Checkout</h1>
      <div className="cart">
        <form className="card-box form" onSubmit={submit} id="checkout-form">
          <h2 className="h-sm">Delivery details</h2>
          <label>Full name<input required value={form.fullName} onChange={set('fullName')} autoComplete="name" /></label>
          <label>Phone<input required value={form.phone} onChange={set('phone')} autoComplete="tel" /></label>
          <label>Street address<input required value={form.street} onChange={set('street')} autoComplete="street-address" /></label>
          <div className="two">
            <label>City<input required value={form.city} onChange={set('city')} autoComplete="address-level2" /></label>
            <label>Postal code<input value={form.postalCode} onChange={set('postalCode')} autoComplete="postal-code" /></label>
          </div>
          <label>Country<input value={form.country} onChange={set('country')} autoComplete="country-name" /></label>
          <h2 className="h-sm">Payment</h2>
          <p className="pay-box"><strong>Cash on delivery.</strong> <span className="muted">You pay when your order arrives.</span></p>
          {err && <p className="err-text">{err}</p>}
        </form>

        <aside className="summary">
          <h2 className="h-sm">Your order</h2>
          {cart.map((l) => (
            <div key={l.lineId} className="mini">
              <img src={imgUrl(l.image)} alt="" />
              <div><strong className="small">{l.name}</strong><p className="muted small">{l.size} / {l.color} × {l.qty}</p></div>
              <strong>{money(l.price * l.qty)}</strong>
            </div>
          ))}
          <hr className="rule" />
          <div className="sum-row"><span className="muted">Subtotal</span><strong>{money(subtotal)}</strong></div>
          {discount > 0 && <div className="sum-row"><span className="muted">Discount ({couponCode})</span><strong className="red">-{money(discount)}</strong></div>}
          <div className="sum-row"><span className="muted">Delivery fee</span><strong>{money(fee)}</strong></div>
          <div className="sum-row total"><span>Total</span><strong>{money(total)}</strong></div>
          <button className="btn block" form="checkout-form" disabled={saving}>{saving ? 'Placing order…' : 'Place order'}</button>
        </aside>
      </div>
    </div>
  );
}
