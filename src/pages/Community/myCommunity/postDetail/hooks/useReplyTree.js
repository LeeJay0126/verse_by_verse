import { useMemo } from "react";

const useReplyTree = (replies) => {
  return useMemo(() => {
    const byParent = new Map();
    const byId = new Map();

    for (const r of replies || []) {
      const id = String(r.id || r._id || "");
      if (!id) continue;
      byId.set(id, r);
    }

    for (const r of replies || []) {
      const id = String(r.id || r._id || "");
      if (!id) continue;

      const rawParentKey = r.parentReplyId ? String(r.parentReplyId) : "";
      const parentKey = rawParentKey && rawParentKey !== id && byId.has(rawParentKey) ? rawParentKey : "root";
      if (!byParent.has(parentKey)) byParent.set(parentKey, []);
      byParent.get(parentKey).push(r);
    }

    const statsCache = new Map();

    const getStats = (id) => {
      if (statsCache.has(id)) return statsCache.get(id);

      const self = byId.get(id);
      const children = byParent.get(id) || [];

      let count = children.length;
      let latest = self?.createdAt ? new Date(self.createdAt) : new Date(0);

      for (const c of children) {
        const s = getStats(String(c.id));
        count += s.count;
        if (s.latest > latest) latest = s.latest;
      }

      const result = { count, latest };
      statsCache.set(id, result);
      return result;
    };

    const sortFn = (a, b) => {
      const sa = getStats(String(a.id));
      const sb = getStats(String(b.id));
      if (sb.count !== sa.count) return sb.count - sa.count;
      return sb.latest - sa.latest;
    };

    for (const [, arr] of byParent.entries()) {
      arr.sort(sortFn);
    }

    return { byParent };
  }, [replies]);
};

export default useReplyTree;
