export const money = (n) => {
  const v = Number(n) || 0;
  return Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`;
};
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
export const shortId = (id) => String(id).slice(-6).toUpperCase();
