import { useEffect, useState, useCallback, useMemo } from 'react';
import API from "../../component/Key";
import GetBookVersions from "./bookVersions/GetBookVersions";
import BibleVersion from './bibleVersions/BibleVersions';
import Verse from './verseDisplay/Verse';

// KOR chapter counts for ibibles.net mapping
const KOR_CHAPTER_COUNTS = {
  ge: 50, exo: 40, lev: 27, num: 36, deu: 34,
  josh: 24, jdgs: 21, ruth: 4, "1sm": 31, "2sm": 24,
  "1ki": 22, "2ki": 25, "1chr": 29, "2chr": 36,
  ezra: 10, neh: 13, est: 10, job: 42, psa: 150,
  prv: 31, eccl: 12, ssol: 8, isa: 66, jer: 52,
  lam: 5, eze: 48, dan: 12, hos: 14, joel: 3,
  amos: 9, obad: 1, jonah: 4, mic: 7, nahum: 3,
  hab: 3, zep: 3, hag: 2, zec: 14, mal: 4,
  mat: 28, mark: 16, luke: 24, john: 21, acts: 28,
  rom: 16, "1cor": 16, "2cor": 13, gal: 6, eph: 6,
  phi: 4, col: 4, "1th": 5, "2th": 3,
  "1tim": 6, "2tim": 4, titus: 3, phmn: 1,
  heb: 13, jas: 5, "1pet": 5, "2pet": 3,
  "1jn": 5, "2jn": 1, "3jn": 1, jude: 1, rev: 22,
};

const Bible = () => {
  const [currChapterId, setCurrentChapterId] = useState(null); // e.g., "GEN.3" or "ge.1"
  const [currBook, setCurrBook] = useState({ id: null, name: "" });
  const [currVersion, setVersion] = useState('06125adad2d5898a-01'); // default ASV

  // Ordered list of books for the current version
  const [booksOrder, setBooksOrder] = useState([]); // [{ id, name }]

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const books = await GetBookVersions(currVersion);
      if (!cancelled) setBooksOrder(books || []);
    })();
    return () => { cancelled = true; };
  }, [currVersion]);

  // Cache chapters per book: { [bookId]: [{id, number}] }
  const [chaptersByBook, setChaptersByBook] = useState({});

  const fetchChapters = useCallback(async (bookId) => {
    if (!bookId) return [];

    // KOR uses static chapter counts
    if (currVersion === 'kor') {
      const count = KOR_CHAPTER_COUNTS[bookId] || 0;
      const list = Array.from({ length: count }, (_, i) => ({
        number: i + 1,
        id: `${bookId}.${i + 1}`,
      }));
      setChaptersByBook(prev => ({ ...prev, [bookId]: list }));
      return list;
    }

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

  // Ensure current book chapters are loaded
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

    // within same book
    if (currChapterIndex >= 0 && currChapterIndex < currChapters.length - 1) {
      setCurrentChapterId(currChapters[currChapterIndex + 1].id);
      return;
    }

    // next book's first chapter
    const bi = getBookIndex(currBook.id);
    if (bi >= 0 && bi < booksOrder.length - 1) {
      const nextBook = booksOrder[bi + 1];
      await goToFirstChapterOf(nextBook);
    }
  }, [currBook, currChapters, currChapterIndex, booksOrder, getBookIndex, goToFirstChapterOf]);

  const goPrevChapter = useCallback(async () => {
    if (!currBook?.id) return;

    // within same book
    if (currChapterIndex > 0) {
      setCurrentChapterId(currChapters[currChapterIndex - 1].id);
      return;
    }

    // previous book's last chapter
    const bi = getBookIndex(currBook.id);
    if (bi > 0) {
      const prevBook = booksOrder[bi - 1];
      await goToLastChapterOf(prevBook);
    }
  }, [currBook, currChapters, currChapterIndex, booksOrder, getBookIndex, goToLastChapterOf]);

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
        setBook={(b) => {
          setCurrBook(b || { id: null, name: "" });
          setCurrentChapterId(null);
        }}
        currVersionId={currVersion}
        setCurrentVersion={(v) => {
          setVersion(v);
          setCurrBook({ id: null, name: "" });
          setCurrentChapterId(null);
          setChaptersByBook({});
          setBooksOrder([]);
        }}
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
