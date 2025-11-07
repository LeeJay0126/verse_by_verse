import './BibleVersions.css';
import { GoTriangleDown } from "react-icons/go";
import { useState } from 'react';
import BibleVersionComponent from './BibleVersionComponent';
import BookVersionModal from '../bookVersions/BookVersionModal';

const BibleVersions = ({
  setChapter,
  book,
  setBook,
  currVersionId,
  setCurrentVersion
}) => {
  const [bookModal, setVisibility] = useState(false);
  const [versionModal, setVersionVisibility] = useState(false);
  const [versionLabel, setVersionLabel] = useState("ASV"); // display only

  return (
    <div className="BookVersionHolder">
      {/* Book selector */}
      <div className="Books">
        <section
          className='BookTabContainer'
          onClick={() => setVisibility(!bookModal)}
        >
          <p className="BookNameDisplay">{book?.name || "Select a Book"}</p>
          <GoTriangleDown className="BookVersionDownArrow" />
        </section>

        <BookVersionModal
          key={currVersionId} // remount when version changes
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
      </div>

      {/* Version selector */}
      <div className="Versions">
        <section
          className='VersionTabContainer'
          onClick={() => setVersionVisibility(!versionModal)}
        >
          <p className="VersionNameDisplay">{versionLabel}</p>
          <GoTriangleDown className="BookVersionDownArrow" />
        </section>

        <BibleVersionComponent
          setVis={setVersionVisibility}
          visibilityStatus={versionModal}
          // called with abbreviation (ASV, BSB, engKJV, WEB, FBV, KOR)
          versionChange={(abbr) => {
            setVersionLabel(abbr);
          }}
          // called with underlying id (api.bible id or "kor")
          setCurrentVersionId={(newVersionId) => {
            setCurrentVersion(newVersionId);
            setBook({ id: null, name: "" });
            setChapter(null);
          }}
        />
      </div>
    </div>
  );
};

export default BibleVersions;
