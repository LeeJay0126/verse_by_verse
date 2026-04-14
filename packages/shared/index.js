const API_ENV_KEYS = [
  "REACT_APP_API_BASE_URL",
  "REACT_APP_API_URL",
  "EXPO_PUBLIC_API_BASE_URL",
  "EXPO_PUBLIC_API_URL",
];

const PRODUCT_PILLARS = [
  {
    title: "Read Scripture Intentionally",
    description: "Keep the text central and support slower, more deliberate Bible reading.",
  },
  {
    title: "Capture Insight",
    description: "Give users a durable place to save notes, thoughts, and application.",
  },
  {
    title: "Reflect and Share",
    description: "Connect personal study with community participation and guided discussion.",
  },
];

const MOBILE_ROADMAP = [
  "Authentication and session flow",
  "Notes list and note detail",
  "Bible reading and study flow",
  "Community browse and join flow",
  "Post detail and Bible study share flow",
];

const {
  DEFAULT_COMMUNITY_HERO,
  getApiBase,
  buildApiUrl,
  getAssetUrl,
  buildHeroStyle,
} = require("./apiConfig");
const { createApiClient } = require("./apiClient");
const { createAuthApi } = require("./auth");
const {
  SCRIPTURE_API_ENV_KEYS,
  DEFAULT_BIBLE_VERSION_ID,
  DEFAULT_BIBLE_VERSIONS,
  getScriptureApiKey,
  createBibleApi,
} = require("./bible");
const { createNotesApi } = require("./notes");
const { formatRelativeTime } = require("./time");
const {
  normalizeCommunity,
  normalizeCommunityPost,
  normalizeCommunityReply,
  createCommunityApi,
} = require("./community");

module.exports = {
  API_ENV_KEYS,
  PRODUCT_PILLARS,
  MOBILE_ROADMAP,
  DEFAULT_COMMUNITY_HERO,
  getApiBase,
  buildApiUrl,
  getAssetUrl,
  buildHeroStyle,
  createApiClient,
  createAuthApi,
  SCRIPTURE_API_ENV_KEYS,
  DEFAULT_BIBLE_VERSION_ID,
  DEFAULT_BIBLE_VERSIONS,
  getScriptureApiKey,
  createBibleApi,
  createNotesApi,
  formatRelativeTime,
  normalizeCommunity,
  normalizeCommunityPost,
  normalizeCommunityReply,
  createCommunityApi,
};
