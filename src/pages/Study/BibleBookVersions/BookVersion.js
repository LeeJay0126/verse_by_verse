import './BookVersion.css';
import { GoTriangleDown } from "react-icons/go";
import { useState } from 'react';
import BookVersionComponent from './BookVersionComponent';

const BookVersion = () => {
  const [book, setBook] = useState("Genesis");
  const [chapter, setChapter] = useState("Intro");
  const [bookModal, setVisibility] = useState(false);

  const BookModalVisibilityHandler = () => {
    setVisibility(!bookModal);
  };

  return (
    <div className="BookVersionHolder">
      <div className="Books">
        <p className="BookNameDisplay" onClick={BookModalVisibilityHandler}>{book}</p>
        <GoTriangleDown className="BookVersionDownArrow" onClick={BookModalVisibilityHandler} />
        <BookVersionComponent setVis={setVisibility} visibilityStatus={bookModal} />
      </div>
      <div className="Versions">
        <p className="VersionNameDisplay">NIV</p>
        <GoTriangleDown className="BookVersionDownArrow" />
      </div>
    </div>
  );
};

export default BookVersion;