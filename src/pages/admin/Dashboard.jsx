import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { useAsync } from '../../hooks/useApi';
import { ErrorBox, Loader } from '../../components/State';
import { StatusBadge } from '../Orders';
import { fmtDate, money, shortId } from '../../utils';

export default function Dashboard() {
  const { data: s, loading, error } = useAsync(() => adminApi.stats(), []);
  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;
  return (
    <>
      <h1 className="h-md">Dashboard</h1>
      <div className="stats">
        <div className="stat"><span className="muted small">Revenue (excl. cancelled)</span><strong>{money(s.revenue)}</strong></div>
        <div className="stat"><span className="muted small">Orders</span><strong>{s.orders}</strong></div>
        <div className="stat"><span className="muted small">Products</span><strong>{s.products}</strong></div>
        <div className="stat"><span className="muted small">Customers</span><strong>{s.users}</strong></div>
      </div>

      <h2 className="h-sm">Orders by status</h2>
      <div className="chips">
        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((k) => (
          <span key={k} className="status-count"><StatusBadge status={k} /> {s.ordersByStatus[k] || 0}</span>
        ))}
      </div>

      <h2 className="h-sm">Recent orders</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {s.recentOrders.map((o) => (
              <tr key={o.id}>
                <td><Link to={`/orders/${o.id}`}><u>#{shortId(o.id)}</u></Link></td>
                <td>{o.user ? o.user.name : 'Deleted user'}</td>
                <td>{fmtDate(o.createdAt)}</td>
                <td>{money(o.total)}</td>
                <td><StatusBadge status={o.status} /></td>
              </tr>
            ))}
            {s.recentOrders.length === 0 && <tr><td colSpan="5" className="muted">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
