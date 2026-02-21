const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export const getApiBase = () => API_BASE;

export async function apiFetch(path, options = {}, timeoutMs = 15000) {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const opts = {
    ...options,
    credentials: "include",
    signal: controller.signal,
    headers: { ...(options.headers || {}) },
  };

  if (opts.body && !(opts.body instanceof FormData)) {
    if (!opts.headers["Content-Type"]) opts.headers["Content-Type"] = "application/json";
  }

  console.log("[apiFetch]", opts.method || "GET", url);

  try {
    return await fetch(url, opts);
  } finally {
    clearTimeout(t);
  }
}