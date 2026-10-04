import { useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../api';
import { imgUrl } from '../../api/client';
import { useAsync } from '../../hooks/useApi';
import Pagination from '../../components/Pagination';
import { ErrorBox, Loader } from '../../components/State';
import { money } from '../../utils';

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState(null);
  const { data, loading, error } = useAsync(() => productsApi.list({ page, limit: 12, search, sort: 'newest' }), [page, search, tick]);

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This also deletes its reviews.`)) return;
    try { await productsApi.remove(p.id); setMsg({ ok: true, text: `Deleted ${p.name}.` }); setTick((t) => t + 1); }
    catch (e) { setMsg({ ok: false, text: e.message }); }
  };

  return (
    <>
      <div className="row between wrap-row">
        <h1 className="h-md">Products</h1>
        <Link to="/admin/products/new" className="btn">Add product</Link>
      </div>
      <form className="row gap-s" onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(q.trim()); }}>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" aria-label="Search products" />
        <button className="btn ghost">Search</button>
      </form>
      {msg && <p className={msg.ok ? 'ok-text' : 'err-text'}>{msg.text}</p>}
      {loading ? <Loader /> : error ? <ErrorBox message={error} /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th></th><th>Name</th><th>Category</th><th>Style</th><th>Price</th><th>Stock</th><th>Home section</th><th></th></tr></thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p.id}>
                  <td><img className="tiny" src={imgUrl(p.image)} alt="" /></td>
                  <td>{p.name}</td><td>{p.category}</td><td>{p.style}</td><td>{money(p.price)}</td>
                  <td className={p.stock < 10 ? 'red' : ''}>{p.stock}</td><td>{p.section}</td>
                  <td className="actions"><Link to={`/admin/products/${p.id}/edit`}><u>Edit</u></Link><button className="link danger" onClick={() => remove(p)}>Delete</button></td>
                </tr>
              ))}
              {data.products.length === 0 && <tr><td colSpan="8" className="muted">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </>
  );
}
