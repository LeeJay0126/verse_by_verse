import "./BibleVersionComponent.css";
import VersionList from "./VersionList";
import { Scrollbar } from "react-scrollbars-custom";

const BookVersionComponent = (props) => {
  const modalCloseHandler = () => {
    props.setVis(false);
    console.log(props.visibilityStatus);
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
        <input className="ModalFilterInput" placeholder="Filter Books..." />
      </section>
      <section className="ModalDisplayList">
        <Scrollbar style={{ width: 500, height: 500 }}>
          <VersionList />
        </Scrollbar>
      </section>
    </div>
  );
};

export default BookVersionComponent;
