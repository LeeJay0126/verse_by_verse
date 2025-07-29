import "./BookVersionComponent.css";
import { useState } from "react";

const BookVersionComponent = (props) => {
  return (
    <div className="BookModal">
      <section className="ModalHeader">
        <h3 className="ModalTitle">BOOK</h3>
        <h4 className="ModalExitButton">CANCEL</h4>
      </section>
      <section className="ModalFilter">
        <input className="ModalFilterInput" placeholder="Filter Books..."/>
      </section>
      <section className="ModalDisplayList">
        
      </section>
    </div>
  );
};

export default BookVersionComponent;
