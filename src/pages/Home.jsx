import { useState } from 'react';
import { Link } from 'react-router-dom';
import { metaApi, productsApi } from '../api';
import { imgUrl } from '../api/client';
import { useAsync, useMeta, useProducts } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
import Stars from '../components/Stars';
import { CheckIcon } from '../components/Icons';
import { ErrorBox, Loader } from '../components/State';

const STYLES = ['Casual', 'Formal', 'Party', 'Gym'];
// Put your hero photo in frontend/public and name it hero.jpg (or hero.png / hero.webp)
const HERO_FILES = ['/hero.jpg', '/hero.png', '/hero.webp'];

function Row({ title, params, to }) {
  const { data, loading, error } = useProducts(params);
  return (
    <section className="section wrap">
      <h2 className="sec-title">{title}</h2>
      {loading ? <Loader /> : error ? <ErrorBox message={error} /> : (
        <div className="grid4">{data.products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
      <div className="center"><Link to={to} className="btn ghost wide">View all</Link></div>
    </section>
  );
}

function Hero() {
  const meta = useMeta();
  const { data: count } = useAsync(() => productsApi.list({ limit: 1 }), []);
  const { data: feat } = useProducts({ sort: 'rating', limit: 3 });
  const imgs = feat ? feat.products : [];
  const [heroIdx, setHeroIdx] = useState(0);
  const hasPhoto = heroIdx < HERO_FILES.length;
  return (
    <section className="hero">
      <div className="wrap hero-in">
        <div className="hero-copy">
          <h1>Find clothes that match your style</h1>
          <p className="muted">Browse our range of T-shirts, shirts, jeans, shorts and hoodies, made for everyday comfort and cut for every occasion.</p>
          <Link to="/shop" className="btn wide">Shop now</Link>
          <dl className="hero-stats">
            <div><dt>{count ? count.total : '—'}</dt><dd>Products</dd></div>
            <div><dt>{meta.categories.length || '—'}</dt><dd>Categories</dd></div>
            <div><dt>{meta.styles.length || '—'}</dt><dd>Dress styles</dd></div>
          </dl>
        </div>
        {hasPhoto ? (
          <div className="hero-photo-wrap">
            <img className="hero-photo" src={HERO_FILES[heroIdx]} alt="Models wearing SHOP.CO clothes" onError={() => setHeroIdx((i) => i + 1)} />
          </div>
        ) : (
          <div className="hero-imgs" aria-hidden={imgs.length === 0}>
            {imgs.map((p, i) => (
              <Link key={p.id} to={`/product/${p.id}`} className={`hero-img h${i}`}>
                <img src={imgUrl(p.image)} alt={p.name} />
                <span>{p.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StyleTiles() {
  const { data } = useAsync(() => Promise.all(STYLES.map((s) => productsApi.list({ style: s, limit: 1 }))), []);
  return (
    <section className="section wrap">
      <div className="style-box">
        <h2 className="sec-title">Browse by dress style</h2>
        <div className="style-grid">
          {STYLES.map((s, i) => (
            <Link key={s} to={`/shop/${s.toLowerCase()}`} className={`tile t${i}`}>
              <h3>{s}</h3>
              <span className="muted small">{data ? `${data[i].total} pieces` : ''}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { data } = useAsync(() => metaApi.testimonials(), []);
  if (!data || !data.length) return null;
  return (
    <section className="section">
      <div className="wrap"><h2 className="sec-title left">Our happy customers</h2></div>
      <div className="wrap tests">
        {data.map((t) => (
          <figure key={t.id} className="test">
            <Stars value={t.rating} />
            <figcaption><strong>{t.name}</strong> <CheckIcon width={16} height={16} className="ok" /></figcaption>
            <blockquote className="muted">{t.text}</blockquote>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  return (
    <section className="wrap">
      <div className="news">
        <h2>Stay up to date about our latest offers</h2>
        {done ? <p className="news-ok">Thanks! Use code SAVE20 at checkout.</p> : (
          <form onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" aria-label="Email address" />
            <button className="btn light block">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <div className="cat-strip">
        <div className="wrap">
          {['T-shirts', 'Shirts', 'Jeans', 'Shorts', 'Hoodie'].map((c) => (
            <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`}>{c}</Link>
          ))}
        </div>
      </div>
      <Row title="New arrivals" params={{ section: 'new', limit: 4 }} to="/shop?sort=newest" />
      <div className="wrap"><hr className="rule" /></div>
      <Row title="Top selling" params={{ section: 'top', limit: 4 }} to="/shop?sort=popular" />
      <StyleTiles />
      <Testimonials />
      <Newsletter />
    </>
  );
}
