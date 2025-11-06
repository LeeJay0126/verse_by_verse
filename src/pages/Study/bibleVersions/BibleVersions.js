import './BibleVersions.css';
import { GoTriangleDown } from "react-icons/go";
import { useState } from 'react';
import BibleVersionComponent from './BibleVersionComponent';
import BookVersionModal from '../bookVersions/BookVersionModal';

const BibleVersions = ({ setChapter, book, setBook }) => {
  const [version, setVersion] = useState("ASV");
  const [currVersionID, setCurrentVersion] = useState('06125adad2d5898a-01');
  const [bookModal, setVisibility] = useState(false);
  const [versionModal, setVersionVisibility] = useState(false);

  return (
    <div className="BookVersionHolder">
      <div className="Books">
        <section className='BookTabContainer' onClick={() => setVisibility(!bookModal)}>
          <p className="BookNameDisplay">{book?.name || "Select a Book"}</p>
          <GoTriangleDown className="BookVersionDownArrow" />
        </section>

        <BookVersionModal
          setVis={setVisibility}
          visibilityStatus={bookModal}
          versionId={currVersionID}
          onBookSelect={(b) => { setBook(b); setChapter(null); }}   // clear chapter on new book
          onChapterSelect={setChapter}
          currentBookId={book?.id}
        />
      </div>

      <div className="Versions">
        <section className='VersionTabContainer' onClick={() => setVersionVisibility(!versionModal)}>
          <p className="VersionNameDisplay">{version}</p>
          <GoTriangleDown className="BookVersionDownArrow" />
        </section>
        <BibleVersionComponent
          setVis={setVersionVisibility}
          visibilityStatus={versionModal}
          versionChange={setVersion}
          setCurrentVersionId={setCurrentVersion}
        />
      </div>
    </div>
  );
};

export default BibleVersions;
