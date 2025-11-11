import { useEffect, useMemo, useState, useCallback } from "react";
import "../bibleVersions/BibleVersionComponent.css";
import "../bibleVersions/IndividualVersion.css";
import { Scrollbar } from "react-scrollbars-custom";
import GetBookVersions from "./GetBookVersions";
import Chapter from "./Chapter";

const BookVersionModal = ({
  setVis,
  visibilityStatus,
  versionId,
  onBookSelect,
  onChapterSelect,
  currentBookId
}) => {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(currentBookId ?? null);
  const [error, setError] = useState(null);

  // Separate filters: one for books, one for chapters
  const [bookFilterText, setBookFilterText] = useState("");
  const [chapterFilterText, setChapterFilterText] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!versionId) return;
    (async () => {
      try {
        setError(null);
        const result = await GetBookVersions(versionId);
        if (!cancelled) setBooks(result ?? []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load books");
      }
    })();
    return () => { cancelled = true; };
  }, [versionId]);

  const modalCloseHandler = useCallback(() => setVis(false), [setVis]);

  const backToBooks = useCallback(() => {
    setSelectedBookId(null);
    setChapterFilterText("");
  }, []);

  // Reset all filters when modal closes
  // Reset filters when closing, but KEEP selectedBookId to persist chapter view
  useEffect(() => {
    if (!visibilityStatus) {
      setBookFilterText("");
      setChapterFilterText("");
      // do not reset selectedBookId here
    }
  }, [visibilityStatus]);

  // When opening the modal, if a book is already chosen, start in Chapters view
  useEffect(() => {
    if (visibilityStatus && currentBookId) {
      setSelectedBookId(currentBookId);
    }
  }, [visibilityStatus, currentBookId]);

  // Allow Backspace to go back to Books when viewing Chapters
  useEffect(() => {
    if (!visibilityStatus || selectedBookId == null) return;

    const onKeyDown = (e) => {
      const el = e.target;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);

      if (e.key === "Backspace" && !typing) {
        e.preventDefault();
        setSelectedBookId(null);
        setChapterFilterText("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visibilityStatus, selectedBookId]);

  const filteredBooks = useMemo(() => {
    if (!bookFilterText) return books;
    const q = bookFilterText.toLowerCase();
    return books.filter((b) => b.name.toLowerCase().includes(q));
  }, [books, bookFilterText]);

  const handleBookClick = useCallback(({ id, name }) => {
    setSelectedBookId(id);
    onBookSelect?.({ id, name });
  }, [onBookSelect]);

  const handleChapterSelect = useCallback((chapter) => {
    // chapter: { id, number }
    onChapterSelect?.(chapter.id);
    setVis(false); // optional: close modal after selection
  }, [onChapterSelect, setVis]);

  return (
    <div className={visibilityStatus ? "BookModal" : "ModalHidden"} role="dialog" aria-modal="true">
      <section className="ModalHeader">
        {selectedBookId != null && (
          <button
            className="BookVersionBackButton"
            onClick={backToBooks}
            aria-label="Back to books"
          >
            ←
          </button>
        )}
        <h3 className="ModalTitle">
          {selectedBookId != null ? "Chapters" : "Books"}
        </h3>
        <h4 className="ModalExitButton" onClick={modalCloseHandler} aria-label="Close modal">
          CANCEL
        </h4>
      </section>

      <section className="ModalFilter">
        {!selectedBookId ? (
          <input
            className="ModalFilterInput"
            placeholder="Filter books by name…"
            value={bookFilterText}
            onChange={(e) => setBookFilterText(e.target.value)}
            aria-label="Filter books"
          />
        ) : (
          <input
            className="ModalFilterInput"
            placeholder="Filter chapters by number or name (e.g., '3', 'ch 3')…"
            value={chapterFilterText}
            onChange={(e) => setChapterFilterText(e.target.value)}
            aria-label="Filter chapters"
          />
        )}
      </section>

      <section className="ModalDisplayList">
        <Scrollbar style={{ width: 500, height: 500 }}>
          {error && <li role="alert">Error: {error}</li>}

          {!selectedBookId && !error && (
            filteredBooks.length ? (
              filteredBooks.map(({ id, name }) => (
                <li key={id} className="bibleItem" onClick={() => handleBookClick({ id, name })}>
                  {name}
                </li>
              ))
            ) : (
              <li>No books found…</li>
            )
          )}

          {selectedBookId && !error && (
            <Chapter
              version={versionId}
              book={selectedBookId}
              filterText={chapterFilterText}
              onChapterSelect={handleChapterSelect}
            />
          )}
        </Scrollbar>
      </section>
    </div>
  );
};

export default BookVersionModal;

