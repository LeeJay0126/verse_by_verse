import './BookVersion.css';
import { GoTriangleDown } from "react-icons/go";
import { useState } from 'react';
import BookVersionComponent from './BookVersionComponent';

const BookVersion = () => {
  const [book, setBook] = useState("Genesis");
  const [chapter, setChapter] = useState("Intro");
  const [version, setVersion] = useState("NIV");
  const [bookModal, setVisibility] = useState(false);
  const [versionModal, setVersionVisibility] = useState(false);

  const BookModalVisibilityHandler = () => {
    setVisibility(!bookModal);
  };

  const VersionModalVisibilityHander = () => {
    setVersionVisibility(!versionModal);
  }

  return (
    <div className="BookVersionHolder">
      <div className="Books">
        <p className="BookNameDisplay" onClick={BookModalVisibilityHandler}>{book}</p>
        {/* <GoTriangleDown className="BookVersionDownArrow" onClick={BookModalVisibilityHandler} /> */}
      </div>
      <div className="Versions">
        <p className="VersionNameDisplay" onClick={VersionModalVisibilityHander}>NIV</p>
        <GoTriangleDown className="BookVersionDownArrow" />
        <BookVersionComponent setVis={setVersionVisibility} visibilityStatus={versionModal} />
      </div>
    </div>
  );
};

export default BookVersion;