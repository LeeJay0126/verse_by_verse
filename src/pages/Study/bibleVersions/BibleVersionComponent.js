import { useState } from "react";
import "./BibleVersionComponent.css";
import VersionList from "./VersionList";
import { Scrollbar } from "react-scrollbars-custom";

const BookVersionComponent = (props) => {
  const [filterText, setFilterText] = useState("");

  const modalCloseHandler = () => {
    props.setVis(false);
  };

  const filterChangeHandler = (e) => {
    setFilterText(e.target.value);
  };

  return (
    <div className={props.visibilityStatus ? "BookModal" : "ModalHidden"}>
      <section className="ModalHeader">
        <h3 className="ModalTitle">Versions</h3>
        <h4 className="ModalExitButton" onClick={modalCloseHandler}>
          CANCEL
        </h4>
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
            filterText={filterText} // pass filter text as prop
            setVisibility={props.setVis}
          />
        </Scrollbar>
      </section>
    </div>
  );
};

export default BookVersionComponent;
