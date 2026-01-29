import "./NotesListDrawer.css";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const FILTER = {
  UPDATED: "updated",
  CREATED: "created",
  BOOK: "book",
  VERSION: "version",
};

const safeStr = (v) => (v == null ? "" : String(v));
const ts = (v) => {
  const t = new Date(v || 0).getTime();
  return Number.isFinite(t) ? t : 0;
};

const updatedTs = (n) => ts(n?.updatedAt);
const createdTs = (n) => ts(n?.createdAt);

const versionKeyFromNote = (n) => safeStr(n?.bibleId || n?.versionId || n?.versionName);

const bookKeyFromNote = (n) => {
  const fromChapterId = safeStr(n?.chapterId).split(".")[0];
  return safeStr(n?.bookId || n?.bookName || fromChapterId);
};

const shortPreview = (s, n = 140) => {
  const t = safeStr(s).replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n)}…`;
};

export default function NotesListDrawer({ open, onClose, bibleId, chapterId, onOpenPassage }) {
  const [filterMode, setFilterMode] = useState(FILTER.UPDATED);
  const [currentOnly, setCurrentOnly] = useState(false);

  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scopeChapterId = currentOnly ? safeStr(chapterId) : "";

  const serverSort = useMemo(() => {
    if (filterMode === FILTER.CREATED) return "createdAt:desc";
    return "updatedAt:desc";
  }, [filterMode]);

  const fetchNotes = useCallback(
    async (sortOverride) => {
      if (!open) return;

      setLoading(true);
      setError("");

      try {
        const qs = new URLSearchParams();
        if (bibleId) qs.set("bibleId", bibleId);
        if (scopeChapterId) qs.set("chapterId", scopeChapterId);
        qs.set("sort", sortOverride || serverSort);
        qs.set("limit", "200");
        qs.set("offset", "0");

        const res = await fetch(`${API_BASE}/notes/list?${qs.toString()}`, {
          method: "GET",
          credentials: "include",
          headers: { accept: "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const arr = Array.isArray(json?.notes) ? json.notes : [];
        setNotes(arr);
        setTotal(Number(json?.total || 0));
      } catch (e) {
        setNotes([]);
        setTotal(0);
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    },
    [open, bibleId, scopeChapterId, serverSort]
  );

  useEffect(() => {
    if (!open) return;
    setFilterMode(FILTER.UPDATED);
    setCurrentOnly(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    fetchNotes("updatedAt:desc");
  }, [open, bibleId, fetchNotes]);

  useEffect(() => {
    if (!open) return;
    fetchNotes();
  }, [open, fetchNotes]);

  const visibleNotes = useMemo(() => (Array.isArray(notes) ? notes : []), [notes]);

  const recentlyUpdated = useMemo(() => {
    return [...visibleNotes].sort((a, b) => updatedTs(b) - updatedTs(a));
  }, [visibleNotes]);

  const recentlyCreated = useMemo(() => {
    return [...visibleNotes].sort((a, b) => createdTs(b) - createdTs(a));
  }, [visibleNotes]);

  const sortByBook = useMemo(() => {
    return [...visibleNotes].sort((a, b) => {
      const ab = bookKeyFromNote(a).toLowerCase();
      const bb = bookKeyFromNote(b).toLowerCase();
      if (ab < bb) return -1;
      if (ab > bb) return 1;

      const ac = Number(safeStr(a?.chapterId).split(".")[1] || 0);
      const bc = Number(safeStr(b?.chapterId).split(".")[1] || 0);
      if (ac !== bc) return ac - bc;

      return updatedTs(b) - updatedTs(a);
    });
  }, [visibleNotes]);

  const sortByVersion = useMemo(() => {
    return [...visibleNotes].sort((a, b) => {
      const av = versionKeyFromNote(a).toLowerCase();
      const bv = versionKeyFromNote(b).toLowerCase();
      if (av < bv) return -1;
      if (av > bv) return 1;
      return updatedTs(b) - updatedTs(a);
    });
  }, [visibleNotes]);

  const showDefaultTwoSections = filterMode === FILTER.UPDATED;

  const singleList = useMemo(() => {
    if (filterMode === FILTER.CREATED) return recentlyCreated;
    if (filterMode === FILTER.BOOK) return sortByBook;
    if (filterMode === FILTER.VERSION) return sortByVersion;
    return recentlyUpdated;
  }, [filterMode, recentlyUpdated, recentlyCreated, sortByBook, sortByVersion]);

  const handleClose = () => onClose?.();

  const toggleScope = () => {
    if (!chapterId) return;
    setCurrentOnly((v) => !v);
  };

  const renderItem = (n) => {
    const id = n?._id || n?.id || `${n?.chapterId}-${n?.createdAt}-${n?.updatedAt}`;
    const title = safeStr(n?.title).trim() || "Untitled";
    const ref = safeStr(n?.chapterId);
    const preview = shortPreview(n?.preview || n?.text || "");
    const version = versionKeyFromNote(n);
    const u = updatedTs(n);
    const c = createdTs(n);

    return (
      <li key={id}>
        <button type="button" className="NotesListItemBtn" onClick={() => onOpenPassage?.(n)}>
          <div className="NotesListItemTop">
            <div className="NotesListItemTitle">{title}</div>
            <div className="NotesListItemRef">{ref}</div>
          </div>

          {preview ? <div className="NotesListItemPreview">{preview}</div> : null}

          <div className="NotesListItemMeta">
            <div className="NotesListItemFlex">
              <span>{version ? `Version: ${version}` : ""}</span>
              <span>
                {u ? `Updated ${new Date(u).toLocaleDateString()}` : ""}
                {c ? ` • Created ${new Date(c).toLocaleDateString()}` : ""}
              </span>
            </div>
          </div>
        </button>
      </li>
    );
  };

  return open ? (
    <div className="NotesListOverlay" onMouseDown={handleClose}>
      <div className="NotesListCard" onMouseDown={(e) => e.stopPropagation()}>
        <div className="NotesListHeader">
          <div className="NotesListTitle">Notes</div>
          <button type="button" className="NotesListClose" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="NotesListSub">
          <span>
            {currentOnly ? "Current chapter only" : "All notes"}
            {total ? ` • ${total}` : ""}
          </span>
          <button type="button" className="NotesListPagerBtn" onClick={() => fetchNotes()} disabled={loading}>
            Refresh
          </button>
        </div>

        <div className="NotesListControls">
          <div className="NotesListControl">
            <div className="NotesListControlLabel">Scope</div>
            <button
              type="button"
              className={`NotesListToggleBtn ${currentOnly ? "isOn" : ""}`}
              onClick={toggleScope}
              disabled={!chapterId}
              title={!chapterId ? "Open a chapter first" : ""}
            >
              {currentOnly ? "Current Chapter Only" : "All Notes"}
            </button>
          </div>

          <div className="NotesListControl">
            <div className="NotesListControlLabel">Filter</div>
            <select
              className="NotesListSelect"
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
            >
              <option value={FILTER.UPDATED}>Recently Updated</option>
              <option value={FILTER.CREATED}>Recently Created</option>
              <option value={FILTER.BOOK}>Sort by Book</option>
              <option value={FILTER.VERSION}>Sort by Version</option>
            </select>
          </div>
        </div>

        {error ? <div className="NotesListError">{error}</div> : null}

        {loading ? (
          <div className="NotesListLoading">Loading…</div>
        ) : visibleNotes.length === 0 ? (
          <div className="NotesListEmpty">No notes to show.</div>
        ) : showDefaultTwoSections ? (
          <div className="NotesListScroll">
            <div className="NotesListSectionTitle">Recently Updated</div>
            <ul className="NotesList">{recentlyUpdated.map(renderItem)}</ul>

            <div className="NotesListSectionTitle NotesListSectionTitle--spaced">Recently Created</div>
            <ul className="NotesList">{recentlyCreated.map(renderItem)}</ul>
          </div>
        ) : (
          <ul className="NotesList">{singleList.map(renderItem)}</ul>
        )}
      </div>
    </div>
  ) : null;
}
