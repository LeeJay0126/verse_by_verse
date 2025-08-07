import './BibleVersions.css';
import { GoTriangleDown } from "react-icons/go";
import { useState } from 'react';
import BookVersionComponent from './BibleVersionComponent';
import BookVersionModal from '../bookVersions/BookVersionModal';

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
        <section className='BookTabContainer' onClick={BookModalVisibilityHandler}>
          <p className="BookNameDisplay">{book}</p>
          <GoTriangleDown className="BookVersionDownArrow" />
        </section>
        <BookVersionModal setVis={setVisibility} visibilityStatus={bookModal} />
      </div>
      <div className="Versions">
        <section className='VersionTabContainer' onClick={VersionModalVisibilityHander}>
          <p className="VersionNameDisplay">NIV</p>
          <GoTriangleDown className="BookVersionDownArrow" />
        </section>
        <BookVersionComponent setVis={setVersionVisibility} visibilityStatus={versionModal} />
      </div>
    </div>
  );
};

export default BookVersion;