import "./NotesListDrawer.css";
import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { useNotesApi } from "./useNotesApi";
import NoteDetailModal from "./NoteDetailModal";

const ITEM_GAP_PX = 10;

const shortPreview = (s, n = 140) => {
  const t = (s || "").toString().replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n)}…`;
};

const formatRef = (note) => {
  const [bookId, chapterNum] = (note?.chapterId || "").split(".");
  const base = `${bookId || ""} ${chapterNum || ""}`.trim();

  if (note?.rangeStart == null || note?.rangeEnd == null) return `${base} (full)`;
  if (note.rangeStart === note.rangeEnd) return `${base} (v${note.rangeStart})`;
  return `${base} (v${note.rangeStart}–${note.rangeEnd})`;
};

const NotesListDrawer = ({
  open,
  onClose,
  bibleId = "",
  chapterId = "",
  title = "Notes",
}) => {
  const { listNotes } = useNotesApi();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [activeId, setActiveId] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // NEW: scope + sort
  const canUseChapterScope = !!chapterId;
  const [scope, setScope] = useState("chapter"); // "chapter" | "all"
  const [sortMode, setSortMode] = useState("recent"); // "recent" | "oldest" | "chapter"

  const listRef = useRef(null);

  // If drawer opens on a screen without chapterId, force "all"
  useEffect(() => {
    if (!open) return;
    if (!canUseChapterScope) setScope("all");
    else setScope((s) => (s === "all" ? "all" : "chapter"));
  }, [open, canUseChapterScope]);

  const sortParam = useMemo(() => {
    if (sortMode === "oldest") return "createdAt:asc";
    if (sortMode === "chapter") return "chapterId:asc";
    return "updatedAt:desc"; // most recent
  }, [sortMode]);

  const filterLabel = useMemo(() => {
    if (scope === "all" || !chapterId) return "All notes";
    return `This chapter (${formatRef({ chapterId, rangeStart: null, rangeEnd: null })})`;
  }, [scope, chapterId]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!open) return;

      try {
        setErr("");
        setLoading(true);

        const res = await listNotes({
          q: "",
          bibleId: bibleId || "",
          chapterId: scope === "chapter" ? chapterId : "",
          sort: sortParam,
          limit: 200,
          offset: 0,
        });

        if (!alive) return;

        const arr = Array.isArray(res.notes) ? res.notes : [];
        setNotes(arr);
        setPage(1);
      } catch (e) {
        if (!alive) return;
        setErr(
          e.status === 401
            ? "Please log in to view notes."
            : e.message || "Failed to load notes"
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, bibleId, chapterId, scope, sortParam, listNotes]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useLayoutEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;

    const compute = () => {
      const containerH = el.clientHeight || 0;
      if (!containerH) return;

      const firstBtn = el.querySelector(".NotesListItemBtn");
      if (!firstBtn) return;

      const itemH = firstBtn.getBoundingClientRect().height || 0;
      if (!itemH) return;

      const fit = Math.max(
        1,
        Math.floor((containerH + ITEM_GAP_PX) / (itemH + ITEM_GAP_PX))
      );

      setPageSize((prev) => (prev === fit ? prev : fit));
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    window.addEventListener("resize", compute);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [open, notes.length]);

  const totalNotes = notes.length;
  const totalPages = Math.max(1, Math.ceil(totalNotes / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  useEffect(() => {
    if (!open) return;
    if (page !== safePage) setPage(safePage);
  }, [open, page, safePage]);

  const pageNotes = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return notes.slice(start, end);
  }, [notes, safePage, pageSize]);

  const canPrevPage = safePage > 1;
  const canNextPage = safePage < totalPages;

  const goPrev = () => canPrevPage && setPage((p) => Math.max(1, p - 1));
  const goNext = () => canNextPage && setPage((p) => Math.min(totalPages, p + 1));

  if (!open) return null;

  return (
    <div className="NotesListOverlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="NotesListCard" onMouseDown={(e) => e.stopPropagation()}>
        <div className="NotesListHeader">
          <div className="NotesListTitle">{title}</div>
          <button type="button" className="NotesListClose" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* NEW controls row */}
        <div className="NotesListControls">
          <div className="NotesListControl">
            <label className="NotesListControlLabel">Scope</label>
            <select
              className="NotesListSelect"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              disabled={!canUseChapterScope}
              title={!canUseChapterScope ? "Open from a chapter to enable this" : ""}
            >
              <option value="chapter">This chapter</option>
              <option value="all">All notes</option>
            </select>
          </div>

          <div className="NotesListControl">
            <label className="NotesListControlLabel">Sort</label>
            <select
              className="NotesListSelect"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
            >
              <option value="recent">Most recent</option>
              <option value="oldest">Oldest</option>
              <option value="chapter">By chapter</option>
            </select>
          </div>
        </div>

        <div className="NotesListSub">
          <span className="NotesListSubLabel">{filterLabel}</span>
          <span className="NotesListCount">{totalNotes}</span>
        </div>

        {err && (
          <div className="NotesListError" role="alert">
            {err}
          </div>
        )}

        {loading && <div className="NotesListLoading">Loading…</div>}

        {!loading && !err && totalNotes === 0 && (
          <div className="NotesListEmpty">No notes found.</div>
        )}

        {!loading && !err && totalNotes > 0 && (
          <ul className="NotesList" ref={listRef}>
            {pageNotes.map((n) => (
              <li key={n._id} className="NotesListItem">
                <button
                  type="button"
                  className="NotesListItemBtn"
                  onClick={() => setActiveId(n._id)}
                >
                  <div className="NotesListItemTop">
                    <div className="NotesListItemTitle">{n.title || "Untitled"}</div>
                    <div className="NotesListItemRef">{formatRef(n)}</div>
                  </div>
                  <div className="NotesListItemPreview">{shortPreview(n.preview ?? n.text)}</div>
                  <div className="NotesListItemMeta">
                    {n.updatedAt ? new Date(n.updatedAt).toLocaleString() : "—"}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="NotesListPager">
            <button
              type="button"
              className="NotesListPagerBtn"
              onClick={goPrev}
              disabled={!canPrevPage}
              aria-label="Previous page"
            >
              ←
            </button>

            <div className="NotesListPagerText">
              Page {safePage} / {totalPages}
            </div>

            <button
              type="button"
              className="NotesListPagerBtn"
              onClick={goNext}
              disabled={!canNextPage}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        )}

        {activeId && <NoteDetailModal noteId={activeId} onClose={() => setActiveId(null)} />}
      </div>
    </div>
  );
};

export default NotesListDrawer;
