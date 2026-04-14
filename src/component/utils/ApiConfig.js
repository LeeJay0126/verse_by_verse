import {
  DEFAULT_COMMUNITY_HERO,
  buildApiUrl as sharedBuildApiUrl,
  buildHeroStyle as sharedBuildHeroStyle,
  getApiBase as sharedGetApiBase,
  getAssetUrl as sharedGetAssetUrl,
} from "@verse/shared";

const env = process.env;

export const API_BASE = sharedGetApiBase(env);

export { DEFAULT_COMMUNITY_HERO };

export const getApiBase = () => sharedGetApiBase(env);

export const buildApiUrl = (path = "") => sharedBuildApiUrl(path, env);

export const getAssetUrl = (path, fallback = "") => sharedGetAssetUrl(path, fallback, env);

export const buildHeroStyle = (heroImageUrl, fallback = DEFAULT_COMMUNITY_HERO) =>
  sharedBuildHeroStyle(heroImageUrl, fallback, env);
