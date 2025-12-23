import "./BibleVersions.css";
import { GoTriangleDown } from "react-icons/go";
import { useState } from "react";
import BibleVersionComponent from "./BibleVersionComponent";
import BookVersionModal from "../bookVersions/BookVersionModal";
import Notes from "../Notes/Notes";

const BibleVersions = ({
  disabled = false,
  setChapter,
  book,
  setBook,
  currVersionId,
  setCurrentVersion,

  notesDisabled = true,
  notesActive = false,
  notesHasNote = false,
  onNotesClick,
}) => {
  const [bookModal, setVisibility] = useState(false);
  const [versionModal, setVersionVisibility] = useState(false);
  const [versionLabel, setVersionLabel] = useState("ASV");

  if (disabled && (bookModal || versionModal)) {
    if (bookModal) setVisibility(false);
    if (versionModal) setVersionVisibility(false);
  }

  const guardClick = (fn) => {
    if (disabled) return;
    fn?.();
  };

  return (
    <div className={`BibleVersionsBlock ${disabled ? "isDisabled" : ""}`}>
      <div className="BookVersionHolder">
        <div className="Books">
          <section
            className={`BookTabContainer ${disabled ? "disabled" : ""}`}
            onClick={() => guardClick(() => setVisibility(!bookModal))}
          >
            <p className="BookNameDisplay">{book?.name || "Select a Book"}</p>
            <GoTriangleDown className="BookVersionDownArrow" />
          </section>

          {!disabled && (
            <BookVersionModal
              key={currVersionId}
              setVis={setVisibility}
              visibilityStatus={bookModal}
              versionId={currVersionId}
              onBookSelect={(b) => {
                setBook(b);
                setChapter(null);
              }}
              onChapterSelect={setChapter}
              currentBookId={book?.id}
            />
          )}
        </div>

        <div className="Versions">
          <section
            className={`VersionTabContainer ${disabled ? "disabled" : ""}`}
            onClick={() => guardClick(() => setVersionVisibility(!versionModal))}
          >
            <p className="VersionNameDisplay">{versionLabel}</p>
            <GoTriangleDown className="BookVersionDownArrow" />
          </section>

          {!disabled && (
            <BibleVersionComponent
              setVis={setVersionVisibility}
              visibilityStatus={versionModal}
              versionChange={(abbr) => setVersionLabel(abbr)}
              setCurrentVersionId={(newVersionId) => {
                setCurrentVersion(newVersionId);
                setBook({ id: null, name: "" });
                setChapter(null);
              }}
            />
          )}
        </div>
      </div>

      <div className="NotesRow">
        <Notes
          disabled={notesDisabled || disabled}
          active={notesActive}
          hasNote={notesHasNote}
          onClick={() => {
            if (notesDisabled || disabled) return;
            onNotesClick?.();
            setVisibility(false);
            setVersionVisibility(false);
          }}
        />
      </div>
    </div>
  );
};

export default BibleVersions;
