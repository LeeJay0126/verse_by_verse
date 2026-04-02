import { buildApiUrl, getApiBase } from "./ApiConfig";

export { getApiBase };

export async function apiFetch(path, options = {}, timeoutMs = 15000) {
  const url = buildApiUrl(path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const opts = {
    credentials: "include",
    ...options,
    signal: options.signal || controller.signal,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  };

  console.log("[apiFetch]", opts.method || "GET", url);

  try {
    return await fetch(url, opts);
  } finally {
    clearTimeout(timer);
  }
}
