import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMeta, useProducts } from '../hooks/useApi';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { Empty, ErrorBox, Loader } from '../components/State';
import { FilterIcon } from '../components/Icons';

const LIMIT = 9;
const SORTS = [['popular', 'Most popular'], ['newest', 'Newest'], ['rating', 'Top rated'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']];

export default function Shop() {
  const { styleSlug } = useParams();
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const meta = useMeta();
  const [showFilters, setShowFilters] = useState(false);
  const [price, setPrice] = useState(Number(sp.get('maxPrice')) || 300);

  useEffect(() => { setPrice(Number(sp.get('maxPrice')) || 300); }, [sp]);

  const page = Number(sp.get('page')) || 1;
  const params = {
    style: styleSlug,
    category: sp.get('category'),
    color: sp.get('color'),
    size: sp.get('size'),
    maxPrice: sp.get('maxPrice'),
    search: sp.get('search'),
    sort: sp.get('sort') || 'popular',
    page,
    limit: LIMIT,
  };
  const { data, loading, error } = useProducts(params);

  const setParam = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v === null || v === undefined || v === '') n.delete(k); else n.set(k, v);
    n.delete('page');
    setSp(n);
  };
  const list = (k) => (sp.get(k) || '').split(',').filter(Boolean);
  const toggle = (k, val) => {
    const cur = list(k);
    setParam(k, (cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]).join(','));
  };
  const goPage = (p) => {
    const n = new URLSearchParams(sp);
    n.set('page', p);
    setSp(n);
    window.scrollTo({ top: 0 });
  };
  const commitPrice = () => setParam('maxPrice', price >= 300 ? '' : price);
  const hasFilters = ['category', 'color', 'size', 'maxPrice', 'search'].some((k) => sp.get(k));

  const title = styleSlug ? styleSlug.charAt(0).toUpperCase() + styleSlug.slice(1) : sp.get('search') ? `Results for “${sp.get('search')}”` : 'All products';
  const from = data && data.total ? (data.page - 1) * LIMIT + 1 : 0;
  const to = data ? Math.min(data.page * LIMIT, data.total) : 0;

  return (
    <div className="wrap shop-page">
      <div className="crumbs muted small"><Link to="/">Home</Link> / <span>Shop</span>{styleSlug && <> / <span>{title}</span></>}</div>
      <div className="shop">
        <aside className={`filters ${showFilters ? 'open' : ''}`}>
          <div className="f-head"><h3>Filters</h3>
            {hasFilters && <button className="link" onClick={() => navigate(styleSlug ? `/shop/${styleSlug}` : '/shop')}>Clear all</button>}
          </div>

          <div className="f-block">
            <h4>Dress style</h4>
            <Link to="/shop" className={!styleSlug ? 'on' : ''}>All styles</Link>
            {meta.styles.map((s) => <Link key={s} to={`/shop/${s.toLowerCase()}`} className={styleSlug === s.toLowerCase() ? 'on' : ''}>{s}</Link>)}
          </div>
          <div className="f-block">
            <h4>Category</h4>
            {meta.categories.map((c) => (
              <label key={c} className="check"><input type="checkbox" checked={list('category').includes(c)} onChange={() => toggle('category', c)} />{c}</label>
            ))}
          </div>
          <div className="f-block">
            <h4>Max price: ${price >= 300 ? '300+' : price}</h4>
            <input type="range" min="50" max="300" step="10" value={price} onChange={(e) => setPrice(Number(e.target.value))} onPointerUp={commitPrice} onKeyUp={commitPrice} aria-label="Maximum price" />
          </div>
          <div className="f-block">
            <h4>Colors</h4>
            <div className="swatches">
              {meta.colors.map((c) => (
                <button key={c.name} type="button" title={c.name} aria-label={c.name} aria-pressed={list('color').includes(c.name)}
                  className={`sw ${list('color').includes(c.name) ? 'on' : ''}`} style={{ background: c.hex }} onClick={() => toggle('color', c.name)} />
              ))}
            </div>
          </div>
          <div className="f-block">
            <h4>Size</h4>
            <div className="chips">
              {meta.sizes.map((s) => <button key={s} type="button" className={`chip ${list('size').includes(s) ? 'on' : ''}`} onClick={() => toggle('size', s)}>{s}</button>)}
            </div>
          </div>
          <button className="btn block filters-done" onClick={() => setShowFilters(false)}>Show results</button>
        </aside>

        <section className="results">
          <div className="results-head">
            <h1 className="h-md">{title}</h1>
            <div className="row gap-s">
              <button className="btn ghost sm filter-btn" onClick={() => setShowFilters(true)}><FilterIcon width={18} height={18} /> Filters</button>
              <label className="sort">Sort by
                <select value={params.sort} onChange={(e) => setParam('sort', e.target.value)}>
                  {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
            </div>
          </div>
          {data && <p className="muted small">Showing {from}-{to} of {data.total} products</p>}

          {loading ? <Loader /> : error ? <ErrorBox message={error} /> : data.products.length === 0 ? (
            <Empty title="No products match these filters" text="Try removing a filter or searching for something else." to="/shop" cta="See all products" />
          ) : (
            <div className="grid3">{data.products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          )}
          {data && <Pagination page={data.page} pages={data.pages} onChange={goPage} />}
        </section>
      </div>
    </div>
  );
}
