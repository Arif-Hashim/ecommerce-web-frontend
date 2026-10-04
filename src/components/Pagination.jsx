export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <nav className="pager" aria-label="Pagination">
      <button className="btn ghost sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
      <div className="pager-nums">
        {nums.map((n) => (
          <button key={n} className={`pnum ${n === page ? 'on' : ''}`} onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined}>{n}</button>
        ))}
      </div>
      <button className="btn ghost sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  );
}
