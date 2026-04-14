const API_BASE_ENV_KEYS = [
  "REACT_APP_API_BASE_URL",
  "REACT_APP_API_URL",
  "EXPO_PUBLIC_API_BASE_URL",
  "EXPO_PUBLIC_API_URL",
  "API_BASE_URL",
  "API_URL",
];

const getApiBase = (env = {}) => {
  for (const key of API_BASE_ENV_KEYS) {
    const value = env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim().replace(/\/+$/, "");
    }
  }

  return "";
};

const getApiResolution = (env = {}) => {
  for (const key of API_BASE_ENV_KEYS) {
    const value = env[key];
    if (typeof value === "string" && value.trim()) {
      return {
        source: key,
        value: value.trim().replace(/\/+$/, ""),
      };
    }
  }

  return {
    source: "relative",
    value: "",
  };
};

const DEFAULT_COMMUNITY_HERO = "/community/CommunityDefaultHero.png";

const buildApiUrl = (path = "", env = {}) => {
  const apiBase = getApiBase(env);
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return apiBase ? `${apiBase}${normalizedPath}` : normalizedPath;
};

const getAssetUrl = (path, fallback = "", env = {}) => {
  const value = String(path || "").trim();
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return buildApiUrl(value, env);
};

const buildHeroStyle = (heroImageUrl, fallback = DEFAULT_COMMUNITY_HERO, env = {}) => ({
  backgroundImage: `url("${getAssetUrl(heroImageUrl, fallback, env)}")`,
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
});

module.exports = {
  API_BASE_ENV_KEYS,
  DEFAULT_COMMUNITY_HERO,
  getApiBase,
  getApiResolution,
  buildApiUrl,
  getAssetUrl,
  buildHeroStyle,
};
