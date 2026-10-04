import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ordersApi } from '../api';
import { imgUrl } from '../api/client';
import { useAsync } from '../hooks/useApi';
import { Empty, ErrorBox, Loader } from '../components/State';
import { fmtDate, money, shortId } from '../utils';

export const StatusBadge = ({ status }) => <span className={`status s-${status}`}>{status}</span>;
const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export function OrdersList() {
  const { data, loading, error } = useAsync(() => ordersApi.mine(), []);
  if (loading) return <Loader />;
  if (error) return <div className="wrap"><ErrorBox message={error} /></div>;
  if (!data.length) return <div className="wrap"><Empty title="No orders yet" text="When you place an order it will appear here." to="/shop" cta="Start shopping" /></div>;
  return (
    <div className="wrap cart-page">
      <h1 className="h-lg">My orders</h1>
      <div className="orders">
        {data.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="order-card">
            <div className="row between">
              <strong>Order #{shortId(o.id)}</strong>
              <StatusBadge status={o.status} />
            </div>
            <p className="muted small">{fmtDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} items</p>
            <div className="row between">
              <div className="thumbs-row">{o.items.slice(0, 4).map((i, k) => <img key={k} src={imgUrl(i.image)} alt="" />)}</div>
              <strong>{money(o.total)}</strong>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const placed = (useLocation().state || {}).placed;
  const [tick, setTick] = useState(0);
  const [err, setErr] = useState(null);
  const { data: o, loading, error } = useAsync(() => ordersApi.get(id), [id, tick]);

  if (loading && !o) return <Loader />;
  if (error) return <div className="wrap"><ErrorBox message={error} /></div>;

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try { await ordersApi.cancel(id); setTick((t) => t + 1); } catch (e) { setErr(e.message); }
  };
  const step = STEPS.indexOf(o.status);

  return (
    <div className="wrap cart-page">
      {placed && <div className="banner-ok"><strong>Thank you! Your order has been placed.</strong> We will contact you on {o.shippingAddress.phone} about delivery.</div>}
      <div className="row between wrap-row">
        <h1 className="h-lg">Order #{shortId(o.id)}</h1>
        <StatusBadge status={o.status} />
      </div>
      <p className="muted">Placed on {fmtDate(o.createdAt)}</p>

      {o.status === 'cancelled' ? <p className="err-text">This order was cancelled.</p> : (
        <ol className="steps">
          {STEPS.map((s, i) => <li key={s} className={i <= step ? 'done' : ''}>{s}</li>)}
        </ol>
      )}

      <div className="cart">
        <div className="card-box">
          <h2 className="h-sm">Items</h2>
          {o.items.map((i, k) => (
            <div key={k} className="mini big">
              <img src={imgUrl(i.image)} alt="" />
              <div>
                {i.product ? <Link to={`/product/${i.product}`}><strong>{i.name}</strong></Link> : <strong>{i.name}</strong>}
                <p className="muted small">{i.size} / {i.color} × {i.quantity}</p>
              </div>
              <strong>{money(i.price * i.quantity)}</strong>
            </div>
          ))}
        </div>
        <aside className="summary">
          <h2 className="h-sm">Delivery</h2>
          <p className="small">{o.shippingAddress.fullName}<br />{o.shippingAddress.street}, {o.shippingAddress.city} {o.shippingAddress.postalCode}<br />{o.shippingAddress.country}<br />{o.shippingAddress.phone}</p>
          <hr className="rule" />
          <div className="sum-row"><span className="muted">Subtotal</span><strong>{money(o.subtotal)}</strong></div>
          {o.discount > 0 && <div className="sum-row"><span className="muted">Discount ({o.couponCode})</span><strong className="red">-{money(o.discount)}</strong></div>}
          <div className="sum-row"><span className="muted">Delivery fee</span><strong>{money(o.deliveryFee)}</strong></div>
          <div className="sum-row total"><span>Total</span><strong>{money(o.total)}</strong></div>
          <p className="muted small">Payment: cash on delivery · {o.isPaid ? 'Paid' : 'Not paid yet'}</p>
          {o.status === 'pending' && <button className="btn ghost block" onClick={cancel}>Cancel order</button>}
          {err && <p className="err-text">{err}</p>}
        </aside>
      </div>
    </div>
  );
}
