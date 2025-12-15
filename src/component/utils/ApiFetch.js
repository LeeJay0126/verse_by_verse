const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

export async function apiFetch(path, options = {}) {
  const url =
    path.startsWith("http")
      ? path
      : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  // IMPORTANT: put credentials AFTER spreading options, so it cannot be overridden
  const opts = {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
    },
  };

  // Only set Content-Type automatically when sending JSON
  if (opts.body && !(opts.body instanceof FormData)) {
    if (!opts.headers["Content-Type"]) {
      opts.headers["Content-Type"] = "application/json";
    }
  }

  return fetch(url, opts);
}
