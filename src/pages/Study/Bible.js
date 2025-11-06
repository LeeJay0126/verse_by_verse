import { useEffect, useState, useCallback, useMemo } from 'react';
import API from "../../component/Key"; // adjust path if different
import GetBookVersions from "./bookVersions/GetBookVersions";
import BibleVersion from './bibleVersions/BibleVersions';
import Verse from './verseDisplay/Verse';

const Bible = () => {
  const [currChapterId, setCurrentChapterId] = useState(null); // e.g., "GEN.3"
  const [currBook, setCurrBook] = useState({ id: null, name: "" });
  const [currVersion, setVersion] = useState('06125adad2d5898a-01');

  // Ordered list of books for the current version (as returned by API; preserve order)
  const [booksOrder, setBooksOrder] = useState([]); // [{ id, name }]
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const books = await GetBookVersions(currVersion); // you already have this
      if (!cancelled) setBooksOrder(books || []);
    })();
    return () => { cancelled = true; };
  }, [currVersion]);

  // Cache chapters per book id: { [bookId]: [{ id, number }] }
  const [chaptersByBook, setChaptersByBook] = useState({});

  const fetchChapters = useCallback(async (bookId) => {
    if (!bookId) return [];
    if (chaptersByBook[bookId]) return chaptersByBook[bookId];
    const res = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${currVersion}/books/${bookId}/chapters`,
      { headers: { "api-key": API } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data } = await res.json();
    const arr = (data || []).map(({ id, number }) => ({ id, number }));
    setChaptersByBook(prev => ({ ...prev, [bookId]: arr }));
    return arr;
  }, [currVersion, chaptersByBook]);

  // Ensure current book's chapters are loaded when a book is selected
  useEffect(() => {
    if (currBook?.id) { fetchChapters(currBook.id); }
  }, [currBook?.id, fetchChapters]);

  const currChapters = useMemo(
    () => (currBook?.id ? (chaptersByBook[currBook.id] || []) : []),
    [chaptersByBook, currBook?.id]
  );

  const currChapterIndex = useMemo(
    () => currChapters.findIndex(c => c.id === currChapterId),
    [currChapters, currChapterId]
  );

  const getBookIndex = useCallback(
    (bookId) => booksOrder.findIndex(b => b.id === bookId),
    [booksOrder]
  );

  const goToFirstChapterOf = useCallback(async (bookObj) => {
    const list = await fetchChapters(bookObj.id);
    if (list.length) {
      setCurrBook(bookObj);
      setCurrentChapterId(list[0].id);
    }
  }, [fetchChapters]);

  const goToLastChapterOf = useCallback(async (bookObj) => {
    const list = await fetchChapters(bookObj.id);
    if (list.length) {
      setCurrBook(bookObj);
      setCurrentChapterId(list[list.length - 1].id);
    }
  }, [fetchChapters]);

  const goNextChapter = useCallback(async () => {
    if (!currBook?.id) return;
    // within the same book
    if (currChapterIndex >= 0 && currChapterIndex < currChapters.length - 1) {
      setCurrentChapterId(currChapters[currChapterIndex + 1].id);
      return;
    }
    // move to next book's first chapter
    const bi = getBookIndex(currBook.id);
    if (bi >= 0 && bi < booksOrder.length - 1) {
      const nextBook = booksOrder[bi + 1];
      await goToFirstChapterOf(nextBook);
    }
  }, [currBook, currChapters, currChapterIndex, booksOrder, getBookIndex, goToFirstChapterOf]);

  const goPrevChapter = useCallback(async () => {
    if (!currBook?.id) return;
    // within the same book
    if (currChapterIndex > 0) {
      setCurrentChapterId(currChapters[currChapterIndex - 1].id);
      return;
    }
    // move to previous book's last chapter
    const bi = getBookIndex(currBook.id);
    if (bi > 0) {
      const prevBook = booksOrder[bi - 1];
      await goToLastChapterOf(prevBook);
    }
  }, [currBook, currChapters, currChapterIndex, booksOrder, getBookIndex, goToLastChapterOf]);

  // Visibility of arrows (hide when no prev/next available)
  const canPrev = !!currBook?.id && (
    (currChapterIndex > 0) || (getBookIndex(currBook.id) > 0)
  );
  const canNext = !!currBook?.id && (
    (currChapterIndex >= 0 && currChapterIndex < currChapters.length - 1) ||
    (getBookIndex(currBook.id) < booksOrder.length - 1)
  );

  return (
    <section className="ReadBible">
      <BibleVersion
        setChapter={setCurrentChapterId}
        book={currBook}
        setBook={(b) => { setCurrBook(b); setCurrentChapterId(null); }} // clear chapter on new book
        // Currently not needed, but might be needed later for Korean Language
        // currVersionId={currVersion}
        // setCurrentVersion={setVersion}
      />
      <Verse
        chapterId={currChapterId}
        currVersionId={currVersion}
        book={currBook}
        onPrev={goPrevChapter}
        onNext={goNextChapter}
        canPrev={canPrev}
        canNext={canNext}
      />
    </section>
  );
};

export default Bible;
