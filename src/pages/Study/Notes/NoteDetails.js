import "./NoteDetails.css";
import { useEffect, useMemo, useState } from "react";
import { useNotesApi } from "./useNotesApi";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../component/context/AuthContext";

const formatRangeLabel = (n) => {
  if (!n) return "";
  const { rangeStart, rangeEnd } = n;
  if (rangeStart == null || rangeEnd == null) return " (full chapter)";
  if (rangeStart === rangeEnd) return ` (v${rangeStart})`;
  return ` (v${rangeStart}–${rangeEnd})`;
};

const formatRef = (note) => {
  const chap = note?.chapterId || "";
  // chap format like "GEN.1"
  const [bookId, chNum] = chap.split(".");
  const friendly = `${bookId || ""} ${chNum || ""}`.trim();
  return `${friendly}${formatRangeLabel(note)}`.trim();
};

const NoteDetail = ({
  noteId: noteIdProp,
  initialNote = null,
  onClose,
  onOpenPassage, 
}) => {
  const params = useParams();
  const noteId = noteIdProp || params.noteId;

  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  const { getNote, updateNote, deleteNote } = useNotesApi();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState(initialNote);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [dirty, setDirty] = useState(false);

  const canEdit = !!user && !initializing;

  // fetch note if not provided
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!noteId) return;
      if (initialNote && initialNote._id === noteId) return;

      try {
        setErr("");
        setLoading(true);
        const res = await getNote(noteId);
        if (!alive) return;

        setNote(res.note || null);
      } catch (e) {
        if (!alive) return;
        setErr(e.status === 401 ? "Please log in to view notes." : (e.message || "Failed to load note"));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  // sync drafts when note changes
  useEffect(() => {
    if (!note) return;
    setTitle(note.title || "");
    setText(note.text || "");
    setDirty(false);
  }, [note]);

  const reference = useMemo(() => formatRef(note), [note]);

  const handleSave = async () => {
    if (!note?._id) return;
    if (!canEdit) return;

    try {
      setErr("");
      setLoading(true);

      const res = await updateNote(note._id, { title, text });
      setNote(res.note || note);
      setDirty(false);
    } catch (e) {
      setErr(e.status === 401 ? "Please log in to save notes." : (e.message || "Failed to save"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note?._id) return;
    if (!canEdit) return;

    const ok = window.confirm("Delete this note? This cannot be undone.");
    if (!ok) return;

    try {
      setErr("");
      setLoading(true);

      await deleteNote(note._id);

      // modal -> close, page -> back to list
      if (onClose) onClose();
      else navigate("/notes");
    } catch (e) {
      setErr(e.status === 401 ? "Please log in to delete notes." : (e.message || "Failed to delete"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPassage = () => {
    if (!note) return;

    if (onOpenPassage) {
      onOpenPassage(note);
      return;
    }

    // Default fallback: just go to home or bible route if you have one.
    // Replace "/bible" with your actual Bible page route.
    navigate("/bible", { state: { note } });
  };

  return (
    <div className="NoteDetail">
      <div className="NoteDetailTop">
        <div className="NoteDetailMeta">
          <div className="NoteDetailLabel">Reference</div>
          <div className="NoteDetailRef">{reference || "—"}</div>
        </div>

        <div className="NoteDetailTopActions">
          <button
            type="button"
            className="NoteBtn NoteBtnGhost"
            onClick={handleOpenPassage}
            disabled={!note}
            title="Open this passage"
          >
            Open passage
          </button>

          {onClose && (
            <button type="button" className="NoteBtn NoteBtnGhost" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>

      {err && <div className="NoteDetailError" role="alert">{err}</div>}

      {loading && !note && <div className="NoteDetailLoading">Loading…</div>}

      {note && (
        <>
          <div className="NoteDetailField">
            <div className="NoteDetailLabel">Title</div>
            <input
              className="NoteDetailTitle"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
              disabled={!canEdit}
              placeholder="Note title"
            />
          </div>

          <div className="NoteDetailField">
            <div className="NoteDetailLabel">Note</div>
            <textarea
              className="NoteDetailText"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setDirty(true);
              }}
              disabled={!canEdit}
              placeholder={canEdit ? "Write your note…" : "Log in to edit notes…"}
            />
          </div>

          <div className="NoteDetailFooter">
            {!user && !initializing && (
              <div className="NoteDetailHint">Log in to edit / delete notes.</div>
            )}

            <div className="NoteDetailActions">
              <button
                type="button"
                className="NoteBtn NoteBtnDanger"
                onClick={handleDelete}
                disabled={!canEdit || loading}
              >
                Delete
              </button>

              <button
                type="button"
                className="NoteBtn NoteBtnPrimary"
                onClick={handleSave}
                disabled={!canEdit || loading || !dirty}
                title={!dirty ? "No changes to save" : undefined}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NoteDetail;
