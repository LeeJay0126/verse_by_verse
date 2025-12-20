import "./BibleVersions.css";
import { GoTriangleDown } from "react-icons/go";
import { useState } from "react";
import BibleVersionComponent from "./BibleVersionComponent";
import BookVersionModal from "../bookVersions/BookVersionModal";

const BibleVersions = ({
  disabled = false,
  setChapter,
  book,
  setBook,
  currVersionId,
  setCurrentVersion,
}) => {
  const [bookModal, setVisibility] = useState(false);
  const [versionModal, setVersionVisibility] = useState(false);
  const [versionLabel, setVersionLabel] = useState("ASV");

  // If we become disabled while a modal is open, close them
  if (disabled && (bookModal || versionModal)) {
    // safe immediate close
    if (bookModal) setVisibility(false);
    if (versionModal) setVersionVisibility(false);
  }

  const guardClick = (fn) => {
    if (disabled) return;
    fn?.();
  };

  return (
    <div className={`BookVersionHolder ${disabled ? "isDisabled" : ""}`}>
      {/* Book selector */}
      <div className="Books">
        <section
          className={`BookTabContainer ${disabled ? "disabled" : ""}`}
          onClick={() => guardClick(() => setVisibility(!bookModal))}
          aria-disabled={disabled ? "true" : "false"}
          title={disabled ? "Close notes to change book/chapter" : undefined}
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

      {/* Version selector */}
      <div className="Versions">
        <section
          className={`VersionTabContainer ${disabled ? "disabled" : ""}`}
          onClick={() => guardClick(() => setVersionVisibility(!versionModal))}
          aria-disabled={disabled ? "true" : "false"}
          title={disabled ? "Close notes to change version" : undefined}
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
  );
};

export default BibleVersions;
