export const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export const DEFAULT_COMMUNITY_HERO = "/community/CommunityDefaultHero.png";

export const getApiBase = () => API_BASE;

export const buildApiUrl = (path = "") => {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

export const getAssetUrl = (path, fallback = "") => {
  const value = String(path || "").trim();
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return buildApiUrl(value);
};

export const buildHeroStyle = (heroImageUrl, fallback = DEFAULT_COMMUNITY_HERO) => ({
  backgroundImage: `url("${getAssetUrl(heroImageUrl, fallback)}")`,
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
});
