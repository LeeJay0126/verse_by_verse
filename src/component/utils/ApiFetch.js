const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

export async function apiFetch(path, options = {}) {
  const url =
    path.startsWith("http")
      ? path
      : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const opts = {
    ...options,
    credentials: "include", // ✅ ALWAYS send session cookie
    headers: {
      ...(options.headers || {}),
    },
  };

  // Only add JSON content-type when body is JSON
  if (opts.body && !(opts.body instanceof FormData)) {
    if (!opts.headers["Content-Type"]) {
      opts.headers["Content-Type"] = "application/json";
    }
  }

  return fetch(url, opts);
}
