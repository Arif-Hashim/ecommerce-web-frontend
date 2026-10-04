import { Link } from 'react-router-dom';
import Stars from './Stars';
import { imgUrl } from '../api/client';
import { money } from '../utils';

export default function ProductCard({ product: p }) {
  return (
    <Link to={`/product/${p.id}`} className="pcard">
      <div className="pcard-img">
        <img src={imgUrl(p.image)} alt={p.name} loading="lazy" />
      </div>
      <h3 className="pcard-name">{p.name}</h3>
      <div className="row gap-s">
        <Stars value={p.rating} size={16} />
        <span className="muted small">{p.rating ? `${p.rating}/5` : 'No reviews'}</span>
      </div>
      <div className="price-row">
        <strong>{money(p.price)}</strong>
        {p.oldPrice > p.price && <span className="old">{money(p.oldPrice)}</span>}
        {p.discount > 0 && <span className="pill-red">-{p.discount}%</span>}
      </div>
    </Link>
  );
}
