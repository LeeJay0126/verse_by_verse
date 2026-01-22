import "./NoteDetailModal.css";
import { useState, useCallback } from "react";
import { useNotesApi } from "./useNotesApi";
import NoteDetail from "./NoteDetails";

const NoteDetailModal = ({ noteId, onClose, onOpenPassage, onDeleted, onUpdated }) => {
  const { deleteNote } = useNotesApi();

  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  const onDelete = useCallback(async () => {
    if (!noteId || deleting) return;

    const ok = window.confirm("Delete this note? This cannot be undone.");
    if (!ok) return;

    try {
      setDeleteErr("");
      setDeleting(true);

      await deleteNote(noteId);

      onDeleted?.(noteId);
      onClose?.();
    } catch (e) {
      setDeleteErr(e.message || "Failed to delete note");
    } finally {
      setDeleting(false);
    }
  }, [noteId, deleting, deleteNote, onDeleted, onClose]);

  if (!noteId) return null;

  return (
    <div className="NoteModalOverlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="NoteModalCard" onMouseDown={(e) => e.stopPropagation()}>
        <NoteDetail
          noteId={noteId}
          onClose={onClose}
          onOpenPassage={onOpenPassage}
          onUpdated={onUpdated} 
        />
      </div>
    </div>
  );
};

export default NoteDetailModal;
