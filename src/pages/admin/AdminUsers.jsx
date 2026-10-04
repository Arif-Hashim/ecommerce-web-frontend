import { useState } from 'react';
import { adminApi } from '../../api';
import { useAsync } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { ErrorBox, Loader } from '../../components/State';
import { fmtDate } from '../../utils';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState(null);
  const { data, loading, error } = useAsync(() => adminApi.users(), [tick]);

  const run = async (fn, text) => {
    try { await fn(); setMsg({ ok: true, text }); setTick((t) => t + 1); } catch (e) { setMsg({ ok: false, text: e.message }); }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;
  return (
    <>
      <h1 className="h-md">Users</h1>
      {msg && <p className={msg.ok ? 'ok-text' : 'err-text'}>{msg.text}</p>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td><td>{fmtDate(u.createdAt)}</td>
                <td>
                  <select className="input sm" value={u.role} disabled={u.id === me.id} onChange={(e) => run(() => adminApi.setRole(u.id, e.target.value), `${u.name} is now ${e.target.value}.`)} aria-label={`Role for ${u.name}`}>
                    <option value="user">user</option><option value="admin">admin</option>
                  </select>
                </td>
                <td>{u.id !== me.id && <button className="link danger" onClick={() => window.confirm(`Delete ${u.name}?`) && run(() => adminApi.removeUser(u.id), `Deleted ${u.name}.`)}>Delete</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
