import announcement from "./announcements";
import bibleStudy from "./bibleStudy";
import question from "./question";
import poll from "./poll";

export const COMMUNITY_TYPES = [bibleStudy, question, announcement, poll];

export const getTypeForPost = (post) => {
  for (const t of COMMUNITY_TYPES) {
    if (t.matches(post)) return t;
  }
  return bibleStudy;
};

export const getTypeByApiValue = (apiValue) => {
  const v = String(apiValue || "").toLowerCase();
  return COMMUNITY_TYPES.find((t) => String(t.apiValue || "").toLowerCase() === v) || bibleStudy;
};

export const isAnnouncementPost = (post) =>
  getTypeForPost(post).key === "announcements";

export const getTypeLabel = (post) => getTypeForPost(post).label;

export const getTypeTagClass = (post) => {
  const t = getTypeForPost(post);
  return post?.categoryClass || t.tagClass || "general";
};

const toTime = (v) => {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
};

export const sortPostsPinnedAnnouncementsLatestFirst = (posts) => {
  const announcements = [];
  const normal = [];

  for (const p of posts || []) {
    const isAnn = getTypeForPost(p).key === "announcements";
    (isAnn ? announcements : normal).push(p);
  }

  const byLatest = (a, b) => {
    const bt = toTime(b?.updatedAt || b?.createdAt);
    const at = toTime(a?.updatedAt || a?.createdAt);
    return bt - at;
  };

  announcements.sort(byLatest);
  normal.sort(byLatest);

  return [...announcements, ...normal];
};
