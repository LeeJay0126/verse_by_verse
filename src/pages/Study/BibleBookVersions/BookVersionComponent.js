import "./BookVersionComponent.css";


const BookVersionComponent = (props) => {

  const modalCloseHandler = () => {
    props.setVis(false);
    console.log(props.visibilityStatus);
  };

  return (
    <div className={props.visibilityStatus ? "BookModal" : "ModalHidden"}>
      <section className="ModalHeader">
        <h3 className="ModalTitle">BOOK</h3>
        <h4 className="ModalExitButton" onClick={modalCloseHandler}>
          CANCEL
        </h4>
      </section>
      <section className="ModalFilter">
        <input className="ModalFilterInput" placeholder="Filter Books..." />
      </section>
      <section className="ModalDisplayList"></section>
    </div>
  );
};

export default BookVersionComponent;
