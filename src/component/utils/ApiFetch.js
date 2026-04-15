import { createApiClient } from "@verse/shared";

const isProduction = process.env.NODE_ENV === "production";
const webEnv = isProduction
  ? {
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
    }
  : {
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    };

const { apiFetch, getApiBase } = createApiClient({
  env: webEnv,
  fetchImpl: fetch,
  onResolved: ({ source, value }) => {
    const pageProtocol =
      typeof window !== "undefined" && window.location ? window.location.protocol : "unknown:";
    const isMixedContent =
      pageProtocol === "https:" && typeof value === "string" && value.startsWith("http://");

    console.log("[apiConfig] resolved base", {
      source,
      apiBase: value || "(relative)",
      pageProtocol,
      mixedContentRisk: isMixedContent,
    });

    if (isMixedContent) {
      console.error("[apiConfig] mixed-content risk", {
        pageOrigin: window.location.origin,
        apiBase: value,
      });
    }
  },
  onRequest: ({ method, url }) => {
    console.log("[apiFetch]", method, url);
  },
  onError: ({ error, method, url, apiBase, apiBaseSource, credentials }) => {
    console.error("[apiFetch:error]", {
      message: error?.message || String(error),
      method,
      url,
      apiBase: apiBase || "(relative)",
      apiBaseSource,
      credentials,
    });
  },
});

export { getApiBase };
export { apiFetch };
