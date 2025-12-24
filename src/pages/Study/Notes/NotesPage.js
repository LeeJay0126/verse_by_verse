import "./NotesPage.css";
import { useEffect, useMemo, useState } from "react";
import { useNotesApi } from "./useNotesApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../component/context/AuthContext";
import NoteDetailModal from "./NoteDetailModal";

const isDesktop = () => window.matchMedia && window.matchMedia("(min-width: 768px)").matches;

const shortPreview = (s, n = 140) => {
  const t = (s || "").toString().replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n)}…`;
};

const formatRef = (note) => {
  const [bookId, chapterNum] = (note?.chapterId || "").split(".");
  const base = `${bookId || ""} ${chapterNum || ""}`.trim();

  if (note?.rangeStart == null || note?.rangeEnd == null) return `${base} (full chapter)`;
  if (note.rangeStart === note.rangeEnd) return `${base} (v${note.rangeStart})`;
  return `${base} (v${note.rangeStart}–${note.rangeEnd})`;
};

const NotesPage = ({ onOpenPassage }) => {
  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  const { listNotes } = useNotesApi();

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("updatedAt:desc");

  // optional filters (hook up later)
  const [bibleId, setBibleId] = useState("");
  const [bookId, setBookId] = useState("");

  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // modal state (desktop)
  const [modalId, setModalId] = useState(null);

  const canLoad = !!user && !initializing;

  const queryKey = useMemo(() => {
    return JSON.stringify({ q, sort, bibleId, bookId });
  }, [q, sort, bibleId, bookId]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!canLoad) {
        setNotes([]);
        setTotal(0);
        return;
      }

      try {
        setErr("");
        setLoading(true);

        const res = await listNotes({ q, sort, bibleId, bookId, limit: 100, offset: 0 });
        if (!alive) return;

        setNotes(Array.isArray(res.notes) ? res.notes : []);
        setTotal(Number.isFinite(res.total) ? res.total : (res.notes?.length || 0));
      } catch (e) {
        if (!alive) return;
        setErr(e.status === 401 ? "Please log in to view your notes." : (e.message || "Failed to load notes"));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, canLoad]);

  const openNote = (id) => {
    if (!id) return;

    if (isDesktop()) {
      setModalId(id);
      return;
    }
    navigate(`/notes/${id}`);
  };

  return (
    <div className="NotesPage">
      <header className="NotesPageHeader">
        <div>
          <h1 className="NotesPageTitle">Notes</h1>
          <div className="NotesPageSub">
            {user ? "Your saved chapter and range notes." : "Log in to view and manage notes."}
          </div>
        </div>
      </header>

      <section className="NotesToolbar">
        <input
          className="NotesSearch"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title or text…"
          disabled={!canLoad}
        />

        <select
          className="NotesSelect"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          disabled={!canLoad}
          title="Sort"
        >
          <option value="updatedAt:desc">Most recent</option>
          <option value="updatedAt:asc">Oldest</option>
          <option value="title:asc">Title A→Z</option>
          <option value="title:desc">Title Z→A</option>
        </select>

        {/* Optional filters you can hook up once you have a list of books/versions */}
        <input
          className="NotesFilter"
          value={bibleId}
          onChange={(e) => setBibleId(e.target.value)}
          placeholder="Bible ID (optional)"
          disabled={!canLoad}
        />
        <input
          className="NotesFilter"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          placeholder="Book ID (optional)"
          disabled={!canLoad}
        />
      </section>

      {err && <div className="NotesError" role="alert">{err}</div>}

      {loading && <div className="NotesLoading">Loading…</div>}

      {!loading && canLoad && (
        <div className="NotesCount">
          {total} note{total === 1 ? "" : "s"}
        </div>
      )}

      {!loading && canLoad && notes.length === 0 && !err && (
        <div className="NotesEmpty">
          <div className="NotesEmptyTitle">No notes yet</div>
          <div className="NotesEmptySub">
            Go to a chapter, select a verse range, and save a note.
          </div>
        </div>
      )}

      <ul className="NotesList" aria-label="Notes list">
        {notes.map((n) => (
          <li key={n._id} className="NotesCard">
            <button type="button" className="NotesCardBtn" onClick={() => openNote(n._id)}>
              <div className="NotesCardTop">
                <div className="NotesCardTitle">{n.title || "Untitled"}</div>
                <div className="NotesCardRef">{formatRef(n)}</div>
              </div>

              <div className="NotesCardPreview">
                {shortPreview(n.preview ?? n.text)}
              </div>

              <div className="NotesCardMeta">
                <span>Updated: {n.updatedAt ? new Date(n.updatedAt).toLocaleString() : "—"}</span>
                {n.bibleId ? <span className="NotesBadge">{n.bibleId}</span> : null}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {modalId && (
        <NoteDetailModal
          noteId={modalId}
          onClose={() => setModalId(null)}
          onOpenPassage={onOpenPassage}
        />
      )}
    </div>
  );
};

export default NotesPage;
