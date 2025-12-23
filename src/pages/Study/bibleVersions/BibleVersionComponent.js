import { useState, useMemo } from "react";
import "./BibleVersionComponent.css";
import VersionList from "./VersionList";
import { Scrollbar } from "react-scrollbars-custom";
import Notes from "../Notes/Notes";

const BookVersionComponent = (props) => {
  const [filterText, setFilterText] = useState("");

  const modalCloseHandler = () => {
    props.setVis(false);
  };

  const filterChangeHandler = (e) => {
    setFilterText(e.target.value);
  };

  // Notes button props (safe defaults if not provided)
  const notesDisabled = !!props.notesDisabled;
  const notesActive = !!props.notesActive;
  const notesHasNote = !!props.notesHasNote;

  const onNotesClick = useMemo(() => {
    if (typeof props.onNotesClick === "function") return props.onNotesClick;
    return () => {};
  }, [props.onNotesClick]);

  return (
    <div className={props.visibilityStatus ? "BookModal" : "ModalHidden"}>
      <section className="ModalHeader">
        {/* Left side: Notes (blends with header row, optional) */}
        <div className="ModalHeaderLeft">
          <Notes
            disabled={notesDisabled}
            active={notesActive}
            hasNote={notesHasNote}
            onClick={onNotesClick}
          />
        </div>

        {/* Right side: title + cancel (keeps your existing UX) */}
        <div className="ModalHeaderRight">
          <h3 className="ModalTitle">Versions</h3>
          <h4 className="ModalExitButton" onClick={modalCloseHandler}>
            CANCEL
          </h4>
        </div>
      </section>

      <section className="ModalFilter">
        <input
          className="ModalFilterInput"
          placeholder="Filter versions..."
          value={filterText}
          onChange={filterChangeHandler}
        />
      </section>

      <section className="ModalDisplayList">
        <Scrollbar style={{ width: 500, height: 500 }}>
          <VersionList
            ver={props.versionChange}
            setVersionId={props.setCurrentVersionId}
            filterText={filterText}
            setVisibility={props.setVis}
          />
        </Scrollbar>
      </section>
    </div>
  );
};

export default BookVersionComponent;
