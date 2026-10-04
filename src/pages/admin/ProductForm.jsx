import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '../../api';
import { imgUrl } from '../../api/client';
import { useMeta } from '../../hooks/useApi';
import { Loader } from '../../components/State';

const EMPTY = { name: '', category: '', style: '', price: '', oldPrice: '', discount: '', stock: 50, section: 'none', description: '', colors: [], sizes: [], imageUrl: '' };

export default function ProductForm() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const meta = useMeta();
  const [f, setF] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [current, setCurrent] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    productsApi.get(id).then((p) => {
      setF({ ...EMPTY, ...p, oldPrice: p.oldPrice ?? '', discount: p.discount ?? '', imageUrl: '' });
      setCurrent(p.gallery || []);
    }).catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, [id, editing]);

  const previews = useMemo(() => files.map((x) => URL.createObjectURL(x)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (k, v) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (!f.category || !f.style) return setErr('Choose a category and a dress style.');
    if (!f.colors.length || !f.sizes.length) return setErr('Choose at least one color and one size.');
    if (!editing && !files.length && !f.imageUrl.trim()) return setErr('Add at least one product image.');
    const fd = new FormData();
    ['name', 'category', 'style', 'description', 'section'].forEach((k) => fd.append(k, f[k]));
    ['price', 'oldPrice', 'discount', 'stock'].forEach((k) => { if (f[k] !== '' && f[k] !== null) fd.append(k, f[k]); else if (k === 'oldPrice') fd.append(k, ''); });
    fd.append('colors', JSON.stringify(f.colors));
    fd.append('sizes', JSON.stringify(f.sizes));
    files.forEach((x) => fd.append('images', x));
    if (!files.length && f.imageUrl.trim()) fd.append('imageUrl', f.imageUrl.trim());
    setSaving(true);
    try {
      if (editing) await productsApi.update(id, fd); else await productsApi.create(fd);
      navigate('/admin/products');
    } catch (ex) { setErr(ex.message); setSaving(false); }
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="row between wrap-row"><h1 className="h-md">{editing ? 'Edit product' : 'Add product'}</h1><Link to="/admin/products" className="muted small">← Back to products</Link></div>
      <form className="card-box form wide-form" onSubmit={submit}>
        <label>Name<input required value={f.name} onChange={set('name')} /></label>
        <div className="two">
          <label>Category<select required value={f.category} onChange={set('category')}><option value="">Choose…</option>{meta.categories.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Dress style<select required value={f.style} onChange={set('style')}><option value="">Choose…</option>{meta.styles.map((c) => <option key={c}>{c}</option>)}</select></label>
        </div>
        <div className="four">
          <label>Price ($)<input type="number" min="0" step="0.01" required value={f.price} onChange={set('price')} /></label>
          <label>Old price ($)<input type="number" min="0" step="0.01" value={f.oldPrice} onChange={set('oldPrice')} /></label>
          <label>Discount (%)<input type="number" min="0" max="100" value={f.discount} onChange={set('discount')} /></label>
          <label>Stock<input type="number" min="0" required value={f.stock} onChange={set('stock')} /></label>
        </div>
        <label>Show on home page in
          <select value={f.section} onChange={set('section')}>
            <option value="none">Only in the shop</option><option value="new">New arrivals</option><option value="top">Top selling</option><option value="style">Browse by style area</option>
          </select>
        </label>
        <label>Description<textarea rows={4} value={f.description} onChange={set('description')} /></label>

        <fieldset><legend>Colors</legend>
          <div className="swatch-pick">{meta.colors.map((c) => (
            <label key={c.name} className="check"><input type="checkbox" checked={f.colors.includes(c.name)} onChange={() => toggle('colors', c.name)} /><span className="dot" style={{ background: c.hex }} />{c.name}</label>
          ))}</div>
        </fieldset>
        <fieldset><legend>Sizes</legend>
          <div className="swatch-pick">{meta.sizes.map((s) => (
            <label key={s} className="check"><input type="checkbox" checked={f.sizes.includes(s)} onChange={() => toggle('sizes', s)} />{s}</label>
          ))}</div>
        </fieldset>

        <fieldset><legend>Images</legend>
          {editing && current.length > 0 && (<><p className="muted small">Current images. Uploading new files replaces them.</p><div className="thumbs-row">{current.map((g, i) => <img key={i} src={imgUrl(g)} alt="" />)}</div></>)}
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))} />
          <p className="muted small">Up to 5 images, 5 MB each. The first image is the main one.</p>
          {previews.length > 0 && <div className="thumbs-row">{previews.map((u, i) => <img key={i} src={u} alt="" />)}</div>}
          {!editing && <label>Or paste an image link<input value={f.imageUrl} onChange={set('imageUrl')} placeholder="https://…" /></label>}
        </fieldset>

        {err && <p className="err-text">{err}</p>}
        <div className="row gap-s"><button className="btn" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}</button><Link to="/admin/products" className="btn ghost">Cancel</Link></div>
      </form>
    </>
  );
}
