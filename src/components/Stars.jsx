export default function Stars({ value = 0, size = 18 }) {
  const pct = Math.max(0, Math.min(5, value)) * 20;
  return (
    <span className="stars" style={{ '--r': `${pct}%`, fontSize: size }} role="img" aria-label={`${value} out of 5 stars`}>
      ★★★★★
    </span>
  );
}
