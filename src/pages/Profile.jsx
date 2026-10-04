import { useState } from 'react';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const a = user.address || {};
  const [f, setF] = useState({ name: user.name || '', phone: user.phone || '', street: a.street || '', city: a.city || '', postalCode: a.postalCode || '', country: a.country || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [m1, setM1] = useState(null);
  const [m2, setM2] = useState(null);

  const saveProfile = async (e) => {
    e.preventDefault(); setM1(null);
    try {
      const r = await authApi.updateProfile({ name: f.name, phone: f.phone, address: { street: f.street, city: f.city, postalCode: f.postalCode, country: f.country } });
      setUser(r.user); setM1({ ok: true, text: 'Profile saved.' });
    } catch (ex) { setM1({ ok: false, text: ex.message }); }
  };
  const savePw = async (e) => {
    e.preventDefault(); setM2(null);
    try {
      await authApi.changePassword(pw);
      setPw({ currentPassword: '', newPassword: '' }); setM2({ ok: true, text: 'Password changed.' });
    } catch (ex) { setM2({ ok: false, text: ex.message }); }
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="wrap cart-page">
      <h1 className="h-lg">My profile</h1>
      <div className="two-col">
        <form className="card-box form" onSubmit={saveProfile}>
          <h2 className="h-sm">Details</h2>
          <label>Email<input value={user.email} disabled /></label>
          <label>Full name<input required value={f.name} onChange={set('name')} /></label>
          <label>Phone<input value={f.phone} onChange={set('phone')} /></label>
          <label>Street address<input value={f.street} onChange={set('street')} /></label>
          <div className="two">
            <label>City<input value={f.city} onChange={set('city')} /></label>
            <label>Postal code<input value={f.postalCode} onChange={set('postalCode')} /></label>
          </div>
          <label>Country<input value={f.country} onChange={set('country')} /></label>
          {m1 && <p className={m1.ok ? 'ok-text' : 'err-text'}>{m1.text}</p>}
          <button className="btn">Save changes</button>
        </form>
        <form className="card-box form" onSubmit={savePw}>
          <h2 className="h-sm">Change password</h2>
          <label>Current password<input type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" /></label>
          <label>New password<input type="password" required minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" /></label>
          {m2 && <p className={m2.ok ? 'ok-text' : 'err-text'}>{m2.text}</p>}
          <button className="btn">Update password</button>
        </form>
      </div>
    </div>
  );
}
