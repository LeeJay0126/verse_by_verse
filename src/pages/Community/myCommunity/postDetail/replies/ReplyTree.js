import { useMemo } from "react";

const asArray = (v) => (Array.isArray(v) ? v : []);

const toTime = (iso) => {
  const t = new Date(iso || 0).getTime();
  return Number.isFinite(t) ? t : 0;
};

const useReplyTree = (replies) => {
  return useMemo(() => {
    const list = asArray(replies);

    const byParent = new Map();
    const byId = new Map();

    for (const r of list) {
      if (!r || r.id == null) continue;

      const id = String(r.id);
      byId.set(id, r);

      const parentKey = r.parentReplyId != null ? String(r.parentReplyId) : "root";
      const arr = byParent.get(parentKey);
      if (arr) arr.push(r);
      else byParent.set(parentKey, [r]);
    }

    const statsCache = new Map();

    const getStats = (id) => {
      if (statsCache.has(id)) return statsCache.get(id);

      const children = byParent.get(id) || [];
      let count = children.length;

      for (const c of children) {
        if (!c || c.id == null) continue;
        const s = getStats(String(c.id));
        count += s.count;
      }

      const result = { count };
      statsCache.set(id, result);
      return result;
    };

    const sortFn = (a, b) => {
      const sa = getStats(String(a.id));
      const sb = getStats(String(b.id));

      if (sb.count !== sa.count) return sb.count - sa.count;

      // tie-breaker: oldest -> newest (newest at end)
      return toTime(a.createdAt) - toTime(b.createdAt);
    };

    for (const [, arr] of byParent.entries()) {
      arr.sort(sortFn);
    }

    return { byParent };
  }, [replies]);
};

export default useReplyTree;
