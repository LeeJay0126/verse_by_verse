import "./NotesListDrawer.css";
import { useEffect, useMemo, useState } from "react";
import { useNotesApi } from "./useNotesApi";
import NoteDetailModal from "./NoteDetailModal";

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

  const bookId = useMemo(() => {
    if (!chapterId) return "";
    return String(chapterId).split(".")[0] || "";
  }, [chapterId]);

  const filterLabel = useMemo(() => {
    if (!chapterId) return "All notes";
    return `This chapter (${formatRef({ chapterId, rangeStart: null, rangeEnd: null })})`;
  }, [chapterId]);

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
          bookId: bookId || "",
          sort: "updatedAt:desc",
          limit: 200,
          offset: 0,
        });

        if (!alive) return;

        let arr = Array.isArray(res.notes) ? res.notes : [];

        if (chapterId) {
          arr = arr.filter((n) => n.chapterId === chapterId);
        }

        setNotes(arr);
      } catch (e) {
        if (!alive) return;
        setErr(e.status === 401 ? "Please log in to view notes." : (e.message || "Failed to load notes"));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, bibleId, bookId, chapterId, listNotes]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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

        <div className="NotesListSub">
          <span className="NotesListSubLabel">{filterLabel}</span>
          <span className="NotesListCount">{notes.length}</span>
        </div>

        {err && <div className="NotesListError" role="alert">{err}</div>}

        {loading && <div className="NotesListLoading">Loading…</div>}

        {!loading && !err && notes.length === 0 && (
          <div className="NotesListEmpty">
            No notes found.
          </div>
        )}

        <ul className="NotesList">
          {notes.map((n) => (
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
                <div className="NotesListItemPreview">
                  {shortPreview(n.preview ?? n.text)}
                </div>
                <div className="NotesListItemMeta">
                  {n.updatedAt ? new Date(n.updatedAt).toLocaleString() : "—"}
                </div>
              </button>
            </li>
          ))}
        </ul>

        {activeId && (
          <NoteDetailModal
            noteId={activeId}
            onClose={() => setActiveId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default NotesListDrawer;
