import "./NotesListDrawer.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  return `${base} (v${note.rangeStart}-${note.rangeEnd})`;
};

const isUpdatedAtDesc = (sort) => String(sort || "").toLowerCase() === "updatedat:desc";

const NotesListDrawer = ({
  open,
  onClose,
  bibleId,
  bookId,
  chapterId,
  onOpenPassage,
}) => {
  const { listNotes, deleteNote } = useNotesApi();

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("updatedAt:desc");
  const [scope, setScope] = useState("chapter");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [activeNoteId, setActiveNoteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const listRef = useRef(null);
  const sampleItemRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const el = listRef.current;
    if (!el) return;

    const compute = () => {
      const h = el.clientHeight || 0;
      const itemH = sampleItemRef.current?.getBoundingClientRect?.().height || 88;
      const full = itemH + ITEM_GAP_PX;
      const fit = Math.max(3, Math.min(30, Math.floor(h / full) || 8));

      setPageSize((prev) => (prev === fit ? prev : fit));
    };

    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(el);

    const t = setTimeout(compute, 0);

    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [open]);

  useEffect(() => {
    setPage(1);
  }, [open, bibleId, bookId, chapterId, q, sort, scope]);

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize) || 1),
    [total, pageSize]
  );

  const fetchNotes = useCallback(async () => {
    if (!open) return;

    try {
      setErr("");
      setLoading(true);

      const res = await listNotes({
        q,
        bibleId,
        bookId,
        chapterId: scope === "all" ? "" : chapterId,
        sort,
        limit: pageSize,
        offset,
      });

      const incoming = Array.isArray(res?.notes) ? res.notes : [];
      const incomingTotal = Number.isFinite(res?.total) ? res.total : 0;

      setNotes(incoming);
      setTotal(incomingTotal);

      const maxPage = Math.max(1, Math.ceil(incomingTotal / pageSize) || 1);
      if (page > maxPage) setPage(maxPage);
    } catch (e) {
      setErr(e?.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [
    open,
    listNotes,
    q,
    bibleId,
    bookId,
    chapterId,
    scope,
    sort,
    pageSize,
    offset,
    page,
  ]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const onPrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const onNext = useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

  const onOpenNote = useCallback((id) => setActiveNoteId(id), []);

  const onTrash = useCallback(
    async (noteId) => {
      if (!noteId || deletingId) return;

      const ok = window.confirm("Delete this note? This cannot be undone.");
      if (!ok) return;

      try {
        setErr("");
        setDeletingId(noteId);
        await deleteNote(noteId);

        setNotes((prev) => prev.filter((n) => String(n._id) !== String(noteId)));
        setTotal((t) => Math.max(0, t - 1));
      } catch (e) {
        setErr(e?.message || "Failed to delete note");
      } finally {
        setDeletingId(null);
      }
    },
    [deleteNote, deletingId]
  );

  const onDeletedFromModal = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => String(n._id) !== String(id)));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  const onUpdatedFromModal = useCallback(
    (updated) => {
      if (!updated?._id) return;

      setNotes((prev) => {
        const idx = prev.findIndex((n) => String(n._id) === String(updated._id));
        if (idx === -1) return prev;

        const merged = {
          ...prev[idx],
          ...updated,
          preview: updated.preview ?? shortPreview(updated.text),
        };

        const next = prev.slice();
        next[idx] = merged;

        if (isUpdatedAtDesc(sort)) {
          next.splice(idx, 1);
          next.unshift(merged);
        }

        return next;
      });
    },
    [sort]
  );

  if (!open) return null;

  return (
    <div className="NotesListOverlay" onMouseDown={onClose}>
      <div className="NotesListCard" onMouseDown={(e) => e.stopPropagation()}>
        <div className="NotesListHeader">
          <div className="NotesListTitle">Notes</div>
          <button type="button" className="NotesListClose" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="NotesListControls">
          <div className="NotesListControl">
            <div className="NotesListControlLabel">Sort</div>
            <select className="NotesListSelect" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="updatedAt:desc">Updated (new → old)</option>
              <option value="updatedAt:asc">Updated (old → new)</option>
              <option value="createdAt:desc">Created (new → old)</option>
              <option value="createdAt:asc">Created (old → new)</option>
              <option value="title:asc">Title (A → Z)</option>
              <option value="title:desc">Title (Z → A)</option>
              <option value="chapterId:asc">Chapter (A → Z)</option>
              <option value="chapterId:desc">Chapter (Z → A)</option>
            </select>
          </div>

          <div className="NotesListControl">
            <div className="NotesListControlLabel">View</div>
            <select className="NotesListSelect" value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="chapter">Current chapter</option>
              <option value="all">All chapters</option>
            </select>
          </div>

          <div className="NotesListControl" style={{ flex: 1, minWidth: 0 }}>
            <div className="NotesListControlLabel">Search</div>
            <input
              className="NotesListSelect"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title or text…"
            />
          </div>
        </div>

        <div className="NotesListSub">
          <div>
            Total: <b>{total}</b>
          </div>
          <div>
            Page <b>{page}</b> / {totalPages}
          </div>
        </div>

        {err && (
          <div className="NotesListError" role="alert">
            {err}
          </div>
        )}

        {loading ? (
          <div className="NotesListLoading">Loading…</div>
        ) : notes.length === 0 ? (
          <div className="NotesListEmpty">No notes found.</div>
        ) : (
          <ul className="NotesList" ref={listRef}>
            {notes.map((note, i) => {
              const preview = note.preview ?? shortPreview(note.text);
              const refText = formatRef(note);

              return (
                <li key={note._id}>
                  <button
                    type="button"
                    className="NotesListItemBtn"
                    onClick={() => onOpenNote(note._id)}
                    ref={i === 0 ? sampleItemRef : undefined}
                  >
                    <div className="NotesListItemFlex">
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="NotesListItemTop">
                          <div className="NotesListItemTitle">{note.title || "(Untitled)"}</div>

                          <div className="NotesListItemTopRight">
                            <div className="NotesListItemRef">{refText}</div>

                            <button
                              type="button"
                              className="NotesListTrashBtn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onTrash(note._id);
                              }}
                              disabled={!!deletingId}
                              aria-label="Delete note"
                              title="Delete note"
                            >
                              {deletingId === note._id ? "…" : "🗑"}
                            </button>
                          </div>
                        </div>

                        <div className="NotesListItemPreview">{preview}</div>

                        {note.updatedAt && (
                          <div className="NotesListItemMeta">
                            Updated: {new Date(note.updatedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="NotesListPager">
          <button className="NotesListPagerBtn" onClick={onPrev} disabled={page <= 1}>
            Prev
          </button>

          <div className="NotesListPagerText">
            Page <b>{page}</b> / {totalPages} · {pageSize} per page
          </div>

          <button className="NotesListPagerBtn" onClick={onNext} disabled={page >= totalPages}>
            Next
          </button>
        </div>

        <NoteDetailModal
          noteId={activeNoteId}
          onClose={() => setActiveNoteId(null)}
          onOpenPassage={onOpenPassage}
          onDeleted={onDeletedFromModal}
          onUpdated={onUpdatedFromModal}
        />
      </div>
    </div>
  );
};

export default NotesListDrawer;
