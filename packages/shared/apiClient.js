const { buildApiUrl, getApiBase, getApiResolution } = require("./apiConfig");

const createApiClient = (config = {}) => {
  const {
    env = {},
    fetchImpl = fetch,
    defaultTimeoutMs = 15000,
    defaultCredentials = "include",
    onRequest,
    onError,
    onResolved,
  } = config;

  const resolution = getApiResolution(env);

  if (typeof onResolved === "function") {
    onResolved(resolution);
  }

  const apiFetch = async (path, options = {}, timeoutMs = defaultTimeoutMs) => {
    const url = buildApiUrl(path, env);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const opts = {
      credentials: defaultCredentials,
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    };

    if (typeof onRequest === "function") {
      onRequest({
        method: opts.method || "GET",
        url,
        options: opts,
      });
    }

    try {
      return await fetchImpl(url, opts);
    } catch (error) {
      if (typeof onError === "function") {
        onError({
          error,
          method: opts.method || "GET",
          path,
          url,
          apiBase: resolution.value,
          apiBaseSource: resolution.source,
          credentials: opts.credentials,
        });
      }

      throw error;
    } finally {
      clearTimeout(timer);
    }
  };

  return {
    apiFetch,
    getApiBase: () => getApiBase(env),
  };
};

module.exports = {
  createApiClient,
};
