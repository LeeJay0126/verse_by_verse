import "./Notes.css";

const Notes = ({
  disabled = false,
  active = false,
  hasNote = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      className={`NotesBtn ${active ? "active" : ""} ${hasNote ? "hasNote" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled ? "true" : "false"}
      title={disabled ? "Select a chapter first" : "Open notes"}
    >
      Notes
      {hasNote && <span className="NotesDot" aria-hidden="true" />}
      <span className="NotesCaret" aria-hidden="true">▾</span>
    </button>
  );
};

export default Notes;
