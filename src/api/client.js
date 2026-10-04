const BASE = 'https://ecommerce-web-backend-1xki.vercel.app';
export const API = `${BASE}/api`;

// "/uploads/x.jpg" -> full backend url, "https://..." stays as it is
export const imgUrl = (p) => (!p ? '' : /^(https?:|data:)/.test(p) ? p : `${BASE}${p}`);

const TOKEN_KEY = 'shopco_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export async function request(path, { method = 'GET', body, params, auth = true } = {}) {
  const url = new URL(API + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return;
      url.searchParams.set(k, Array.isArray(v) ? v.join(',') : v);
    });
  }
  const headers = {};
  const isForm = body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong');
    err.status = res.status;
    throw err;
  }
  return data;
}
