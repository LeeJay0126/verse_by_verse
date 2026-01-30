import { useCallback, useState } from "react";

const useThreadExpansion = () => {
  const [expanded, setExpanded] = useState(() => new Set());
  const [deepExpanded, setDeepExpanded] = useState(() => new Set());

  const toggleExpanded = useCallback((replyId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      const key = String(replyId);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleDeepExpanded = useCallback((replyId) => {
    setDeepExpanded((prev) => {
      const next = new Set(prev);
      const key = String(replyId);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return { expanded, toggleExpanded, deepExpanded, toggleDeepExpanded };
};

export default useThreadExpansion;
