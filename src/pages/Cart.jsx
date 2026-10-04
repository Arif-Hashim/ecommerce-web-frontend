import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { couponsApi } from '../api';
import { imgUrl } from '../api/client';
import { useMeta } from '../hooks/useApi';
import { useCart } from '../context/CartContext';
import { TrashIcon } from '../components/Icons';
import { Empty } from '../components/State';
import { money } from '../utils';

export default function Cart() {
  const { cart, subtotal, updateQty, removeFromCart, busy, error, clearError } = useCart();
  const meta = useMeta();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const [discount, setDiscount] = useState(0);
  const [msg, setMsg] = useState(null);

  // keep the discount correct when quantities change
  useEffect(() => {
    if (!applied) return;
    if (subtotal <= 0) { setApplied(''); setDiscount(0); return; }
    couponsApi.validate(applied, subtotal).then((r) => setDiscount(r.discount)).catch((e) => {
      setApplied(''); setDiscount(0); setMsg({ ok: false, text: e.message });
    });
  }, [applied, subtotal]);

  const apply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      const r = await couponsApi.validate(code.trim(), subtotal);
      setApplied(r.code); setDiscount(r.discount); setCode('');
      setMsg({ ok: true, text: `Promo code ${r.code} applied.` });
    } catch (err) { setMsg({ ok: false, text: err.message }); }
  };

  if (cart.length === 0) {
    return <div className="wrap"><Empty title="Your cart is empty" text="Add something you like and it will show up here." to="/shop" cta="Start shopping" /></div>;
  }

  const fee = meta.deliveryFee;
  const total = subtotal - discount + fee;

  return (
    <div className="wrap cart-page">
      <h1 className="h-lg">Your cart</h1>
      {error && <p className="err-text" onClick={clearError}>{error}</p>}
      <div className="cart">
        <div className="cart-lines">
          {cart.map((l) => (
            <div key={l.lineId} className="line">
              <Link to={`/product/${l.id}`} className="line-img"><img src={imgUrl(l.image)} alt={l.name} /></Link>
              <div className="line-info">
                <div className="row between">
                  <Link to={`/product/${l.id}`}><h3 className="h-xs">{l.name}</h3></Link>
                  <button className="icon-btn danger" onClick={() => removeFromCart(l.lineId)} aria-label={`Remove ${l.name}`}><TrashIcon width={20} height={20} /></button>
                </div>
                <p className="small">Size: <span className="muted">{l.size}</span></p>
                <p className="small">Color: <span className="muted">{l.color}</span></p>
                <div className="row between">
                  <strong className="big-price">{money(l.price)}</strong>
                  <div className="qty sm">
                    <button disabled={busy} onClick={() => updateQty(l.lineId, l.qty - 1)} aria-label="Decrease quantity">−</button>
                    <span>{l.qty}</span>
                    <button disabled={busy} onClick={() => updateQty(l.lineId, l.qty + 1)} aria-label="Increase quantity">+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h2 className="h-sm">Order summary</h2>
          <div className="sum-row"><span className="muted">Subtotal</span><strong>{money(subtotal)}</strong></div>
          {discount > 0 && <div className="sum-row"><span className="muted">Discount ({applied})</span><strong className="red">-{money(discount)}</strong></div>}
          <div className="sum-row"><span className="muted">Delivery fee</span><strong>{money(fee)}</strong></div>
          <hr className="rule" />
          <div className="sum-row total"><span>Total</span><strong>{money(total)}</strong></div>

          <form className="promo" onSubmit={apply}>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Add promo code" aria-label="Promo code" />
            <button className="btn">Apply</button>
          </form>
          {msg && <p className={msg.ok ? 'ok-text' : 'err-text'}>{msg.text}</p>}
          <button className="btn block" onClick={() => navigate('/checkout', { state: { couponCode: applied } })}>Go to checkout</button>
        </aside>
      </div>
    </div>
  );
}
