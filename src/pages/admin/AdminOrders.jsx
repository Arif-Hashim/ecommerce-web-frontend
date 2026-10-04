import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api';
import { useAsync } from '../../hooks/useApi';
import Pagination from '../../components/Pagination';
import { ErrorBox, Loader } from '../../components/State';
import { fmtDate, money, shortId } from '../../utils';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState(null);
  const { data, loading, error } = useAsync(() => ordersApi.all({ status, page, limit: 15 }), [status, page, tick]);

  const change = async (o, next) => {
    try { await ordersApi.setStatus(o.id, next); setMsg({ ok: true, text: `Order #${shortId(o.id)} is now ${next}.` }); setTick((t) => t + 1); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
  };

  return (
    <>
      <div className="row between wrap-row">
        <h1 className="h-md">Orders</h1>
        <label className="sort">Show
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All orders</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      {msg && <p className={msg.ok ? 'ok-text' : 'err-text'}>{msg.text}</p>}
      {loading ? <Loader /> : error ? <ErrorBox message={error} /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/orders/${o.id}`}><u>#{shortId(o.id)}</u></Link></td>
                  <td>{o.user ? <>{o.user.name}<br /><span className="muted small">{o.user.email}</span></> : 'Deleted user'}</td>
                  <td>{fmtDate(o.createdAt)}</td>
                  <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td>{money(o.total)}</td>
                  <td>
                    <select className="input sm" value={o.status} disabled={o.status === 'cancelled'} onChange={(e) => change(o, e.target.value)} aria-label={`Status for order ${shortId(o.id)}`}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {data.orders.length === 0 && <tr><td colSpan="6" className="muted">No orders found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </>
  );
}
