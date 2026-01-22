import "./NoteDetailModal.css";
import NoteDetail from "./NoteDetails";

const NoteDetailModal = ({ noteId, onClose, onOpenPassage, onUpdated }) => {
  if (!noteId) return null;

  return (
    <div
      className="NoteModalOverlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div
        className="NoteModalCard"
        onMouseDown={(e) => e.stopPropagation()}
      >
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
