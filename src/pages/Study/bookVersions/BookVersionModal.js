import { useEffect, useMemo, useState } from "react";
import "../bibleVersions/BibleVersionComponent.css";

import { Scrollbar } from "react-scrollbars-custom";
import GetBookVersions from "./GetBookVersions";
import Chapter from "./Chapter";

const BookVersionModal = ({
  setVis,
  visibilityStatus,
  versionId,
  onBookSelect,
  onChapterSelect,
}) => {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    if (!versionId) return;
    GetBookVersions(versionId)
      .then(setBooks)
      .catch((err) => setError(err.message));
  }, [versionId]);

  const modalCloseHandler = () => setVis(false);

  const backToBooks = () => {
    setSelectedBookId(null);
  };

  // Reset search filter when modal closes
  useEffect(() => {
    if (!visibilityStatus) setFilterText("");
  }, [visibilityStatus]);

  // Filter books based on filter text
  const filteredBooks = useMemo(() => {
    if (!filterText) return books;
    return books.filter((book) =>
      book.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [books, filterText]);

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
        <input
          className="ModalFilterInput"
          placeholder="Filter..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </section>

      <section className="ModalDisplayList">
        <Scrollbar style={{ width: 500, height: 500 }}>
          {error && <li>Error: {error}</li>}

          {!selectedBookId &&
            !error &&
            (filteredBooks.length ? (
              filteredBooks.map(({ id, name }) => (
                <li
                  key={id}
                  className="bibleItem"
                  onClick={() => {
                    setSelectedBookId(id);
                    onBookSelect(name);
                  }}
                >
                  {name}
                </li>
              ))
            ) : (
              <li>No books found...</li>
            ))}

          {selectedBookId && (
            <Chapter
              version={versionId}
              book={selectedBookId}
              setChapters={onChapterSelect}
              closeModal={setVis}
            />
          )}
        </Scrollbar>
      </section>
    </div>
  );
};

export default BookVersionModal;
