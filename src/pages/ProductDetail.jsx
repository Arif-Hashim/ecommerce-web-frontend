import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productsApi } from '../api';
import { imgUrl } from '../api/client';
import { useAsync, useMeta } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import Stars from '../components/Stars';
import { CheckIcon } from '../components/Icons';
import { Empty, ErrorBox, Loader } from '../components/State';
import { fmtDate, money } from '../utils';

const FAQS = [
  ['How long does delivery take?', 'Orders are usually delivered within 3 to 5 working days after they are shipped.'],
  ['Can I cancel my order?', 'Yes. While an order is still pending you can cancel it from the My orders page.'],
  ['How do I pay?', 'Payment is cash on delivery. You pay when your order arrives.'],
];

function Reviews({ productId, onChanged }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState(null);

  const load = useCallback(async (p, replace) => {
    setLoading(true);
    try {
      const r = await productsApi.reviews(productId, { page: p, limit: 6 });
      setItems((prev) => (replace ? r.reviews : [...prev, ...r.reviews]));
      setPage(r.page); setPages(r.pages); setTotal(r.total);
    } finally { setLoading(false); }
  }, [productId]);
  useEffect(() => { load(1, true); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await productsApi.addReview(productId, { rating, text });
      setText('');
      setMsg({ ok: true, text: 'Thanks, your review was posted.' });
      await load(1, true);
      onChanged();
    } catch (err) { setMsg({ ok: false, text: err.message }); }
  };

  return (
    <div>
      <h3 className="h-sm">All reviews <span className="muted">({total})</span></h3>
      {loading && !items.length ? <Loader /> : items.length === 0 ? <p className="muted">No reviews yet. Be the first to review this product.</p> : (
        <div className="reviews">
          {items.map((r) => (
            <article key={r.id} className="review">
              <Stars value={r.rating} size={16} />
              <h4>{r.name} {r.verified && <span className="verified"><CheckIcon width={14} height={14} /> Verified purchase</span>}</h4>
              <p className="muted">{r.text}</p>
              <span className="muted small">Posted on {fmtDate(r.createdAt)}</span>
            </article>
          ))}
        </div>
      )}
      {page < pages && <div className="center"><button className="btn ghost" onClick={() => load(page + 1, false)}>Load more reviews</button></div>}

      <div className="review-form">
        <h3 className="h-sm">Write a review</h3>
        {user ? (
          <form onSubmit={submit}>
            <div className="star-pick" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>★</button>
              ))}
            </div>
            <textarea required rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you think of this product?" />
            <button className="btn">Post review</button>
          </form>
        ) : <p className="muted"><Link to="/login" state={{ from: { pathname: `/product/${productId}` } }}><u>Log in</u></Link> to write a review.</p>}
        {msg && <p className={msg.ok ? 'ok-text' : 'err-text'}>{msg.text}</p>}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [tick, setTick] = useState(0);
  const { data: product, loading, error } = useAsync(() => productsApi.get(id), [id, tick]);
  const { data: related } = useAsync(() => productsApi.related(id), [id]);
  const meta = useMeta();
  const { addToCart, error: cartError, clearError, busy } = useCart();

  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState('reviews');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    setColor(product.colors[0] || null);
    setSize(product.sizes[1] || product.sizes[0] || null);
    setActive(0); setQty(1); setAdded(false); clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product && product.id]);

  if (loading && !product) return <Loader />;
  if (error) return <div className="wrap"><ErrorBox message={error} /></div>;
  if (!product) return <div className="wrap"><Empty title="Product not found" to="/shop" cta="Back to shop" /></div>;

  const gallery = product.gallery && product.gallery.length ? product.gallery : [product.image];
  const hexOf = (name) => (meta.colors.find((c) => c.name === name) || {}).hex || '#ccc';
  const soldOut = product.stock < 1;

  const add = async () => {
    setAdded(false);
    const ok = await addToCart(product, color, size, qty);
    if (ok) setAdded(true);
  };

  return (
    <div className="wrap pd-page">
      <div className="crumbs muted small"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> / <span>{product.name}</span></div>
      <div className="pd">
        <div className="gallery">
          <div className="thumbs">
            {gallery.map((g, i) => (
              <button key={g + i} className={i === active ? 'on' : ''} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`}><img src={imgUrl(g)} alt="" /></button>
            ))}
          </div>
          <div className="main-img"><img src={imgUrl(gallery[active])} alt={product.name} /></div>
        </div>

        <div className="pd-info">
          <h1 className="h-lg">{product.name}</h1>
          <div className="row gap-s"><Stars value={product.rating} /><span className="muted">{product.rating || 0}/5 ({product.reviews} reviews)</span></div>
          <div className="price-row big">
            <strong>{money(product.price)}</strong>
            {product.oldPrice > product.price && <span className="old">{money(product.oldPrice)}</span>}
            {product.discount > 0 && <span className="pill-red">-{product.discount}%</span>}
          </div>
          <p className="muted">{product.description}</p>
          <hr className="rule" />

          <h4>Select color: <span className="muted">{color}</span></h4>
          <div className="swatches lg">
            {product.colors.map((c) => (
              <button key={c} className={`sw ${c === color ? 'on' : ''}`} style={{ background: hexOf(c) }} onClick={() => setColor(c)} aria-label={c} aria-pressed={c === color} title={c} />
            ))}
          </div>
          <h4>Choose size</h4>
          <div className="chips">
            {product.sizes.map((s) => <button key={s} className={`chip ${s === size ? 'on' : ''}`} onClick={() => setSize(s)} aria-pressed={s === size}>{s}</button>)}
          </div>
          <hr className="rule" />

          <div className="buy">
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 1, qty + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button className="btn grow" disabled={soldOut || busy} onClick={add}>{soldOut ? 'Out of stock' : busy ? 'Adding…' : 'Add to cart'}</button>
          </div>
          <p className="muted small">{soldOut ? 'This item is currently unavailable.' : product.stock <= 10 ? `Only ${product.stock} left in stock.` : 'In stock.'}</p>
          {added && <p className="ok-text">Added to your cart. <Link to="/cart"><u>View cart</u></Link></p>}
          {cartError && !added && <p className="err-text">{cartError}</p>}
        </div>
      </div>

      <div className="tabs" role="tablist">
        {[['details', 'Product details'], ['reviews', 'Ratings & reviews'], ['faqs', 'FAQs']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="tab-body">
        {tab === 'details' && (
          <dl className="specs">
            <dt>Category</dt><dd>{product.category}</dd>
            <dt>Dress style</dt><dd>{product.style}</dd>
            <dt>Colors</dt><dd>{product.colors.join(', ')}</dd>
            <dt>Sizes</dt><dd>{product.sizes.join(', ')}</dd>
            <dt>About</dt><dd>{product.description}</dd>
          </dl>
        )}
        {tab === 'reviews' && <Reviews productId={product.id} onChanged={() => setTick((t) => t + 1)} />}
        {tab === 'faqs' && FAQS.map(([q, a]) => <details key={q} className="faq"><summary>{q}</summary><p className="muted">{a}</p></details>)}
      </div>

      {related && related.products.length > 0 && (
        <section className="section">
          <h2 className="sec-title">You might also like</h2>
          <div className="grid4">{related.products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
