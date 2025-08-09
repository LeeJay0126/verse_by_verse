import { useEffect, useState } from "react";
import "../bibleVersions/BibleVersionComponent.css";
import "../bibleVersions/IndividualVersion.css"
import { Scrollbar } from "react-scrollbars-custom";
import GetBookVersions from "./GetBookVersions";
import Chapter from "./Chapter";

const BookVersionModal = ({ setVis, visibilityStatus, versionId, onBookSelect, onChapterSelect }) => {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!versionId) return;
    GetBookVersions(versionId)
      .then(setBooks)
      .catch(err => setError(err.message));
  }, [versionId]);

  const modalCloseHandler = () => setVis(false);

  // Back to books list handler
  const backToBooks = () => {
    setSelectedBookId(null);
  };

  return (
    <div className={visibilityStatus ? "BookModal" : "ModalHidden"}>
      <section className="ModalHeader">
        {selectedBookId && (
          <button className="BookVersionBackButton" onClick={backToBooks}>
            ←
          </button>
        )}
        <h3 className="ModalTitle">{selectedBookId ? "Chapters" : "Books"}</h3>
        <h4 className="ModalExitButton" onClick={modalCloseHandler}>
          CANCEL
        </h4>
      </section>

      <section className="ModalFilter">
        <input className="ModalFilterInput" placeholder="Filter..." />
      </section>

      <section className="ModalDisplayList">
        <Scrollbar style={{ width: 500, height: 500 }}>
          {error && <li>Error: {error}</li>}

          {!selectedBookId && !error && (
            books.length
              ? books.map(({ id, name }) => (
                <li className="bibleItem"
                  key={id}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedBookId(id);
                    onBookSelect(name);
                  }}
                >
                  {name}
                </li>
              ))
              : <li>Loading books...</li>
          )}

          {selectedBookId && (
            <Chapter
              version={versionId}
              book={selectedBookId}
              setChapters={(chapters) => {
                if (chapters.length > 0) onChapterSelect(`Chapter ${chapters[0].number}`);
              }}
            />
          )}
        </Scrollbar>
      </section>
    </div>
  );
};

export default BookVersionModal;
