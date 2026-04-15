import {
  DEFAULT_COMMUNITY_HERO,
  buildApiUrl as sharedBuildApiUrl,
  buildHeroStyle as sharedBuildHeroStyle,
  getApiBase as sharedGetApiBase,
  getAssetUrl as sharedGetAssetUrl,
} from "@verse/shared";

const env = process.env;
const isProduction = env.NODE_ENV === "production";

const webEnv = isProduction
  ? {
      NODE_ENV: env.NODE_ENV,
      REACT_APP_API_BASE_URL: env.REACT_APP_API_BASE_URL,
    }
  : {
      NODE_ENV: env.NODE_ENV,
      REACT_APP_API_BASE_URL: env.REACT_APP_API_BASE_URL,
      REACT_APP_API_URL: env.REACT_APP_API_URL,
    };

export const API_BASE = sharedGetApiBase(webEnv);

export { DEFAULT_COMMUNITY_HERO };

export const getApiBase = () => sharedGetApiBase(webEnv);

export const buildApiUrl = (path = "") => sharedBuildApiUrl(path, webEnv);

export const getAssetUrl = (path, fallback = "") => sharedGetAssetUrl(path, fallback, webEnv);

export const buildHeroStyle = (heroImageUrl, fallback = DEFAULT_COMMUNITY_HERO) =>
  sharedBuildHeroStyle(heroImageUrl, fallback, webEnv);
