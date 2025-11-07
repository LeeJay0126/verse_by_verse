import { useEffect, useState, useCallback, useMemo } from "react";
import API from "../../component/Key";
import GetBookVersions from "./bookVersions/GetBookVersions";
import BibleVersion from "./bibleVersions/BibleVersions";
import Verse from "./verseDisplay/Verse";

// Static chapter counts for Korean ibibles.net mapping
const KOR_CHAPTER_COUNTS = {
  ge: 50,
  exo: 40,
  lev: 27,
  num: 36,
  deu: 34,
  josh: 24,
  jdgs: 21,
  ruth: 4,
  "1sm": 31,
  "2sm": 24,
  "1ki": 22,
  "2ki": 25,
  "1chr": 29,
  "2chr": 36,
  ezra: 10,
  neh: 13,
  est: 10,
  job: 42,
  psa: 150,
  prv: 31,
  eccl: 12,
  ssol: 8,
  isa: 66,
  jer: 52,
  lam: 5,
  eze: 48,
  dan: 12,
  hos: 14,
  joel: 3,
  amos: 9,
  obad: 1,
  jonah: 4,
  mic: 7,
  nahum: 3,
  hab: 3,
  zep: 3,
  hag: 2,
  zec: 14,
  mal: 4,
  mat: 28,
  mark: 16,
  luke: 24,
  john: 21,
  acts: 28,
  rom: 16,
  "1cor": 16,
  "2cor": 13,
  gal: 6,
  eph: 6,
  phi: 4,
  col: 4,
  "1th": 5,
  "2th": 3,
  "1tim": 6,
  "2tim": 4,
  titus: 3,
  phmn: 1,
  heb: 13,
  jas: 5,
  "1pet": 5,
  "2pet": 3,
  "1jn": 5,
  "2jn": 1,
  "3jn": 1,
  jude: 1,
  rev: 22,
};

const Bible = () => {
  const [currChapterId, setCurrentChapterId] = useState(null); // e.g. "gen.1"
  const [currBook, setCurrBook] = useState({ id: null, name: "" });
  const [currVersion, setCurrVersion] = useState("06125adad2d5898a-01"); // default ASV

  // Ordered list of books for current version: [{ id, name }]
  const [booksOrder, setBooksOrder] = useState([]);

  // Cache of chapters per book: { [bookId]: [{ id, number }] }
  const [chaptersByBook, setChaptersByBook] = useState({});

  // ---- Load books when version changes ----
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const books = await GetBookVersions(currVersion); // returns KOR_BOOKS for "kor"
        if (!cancelled) {
          setBooksOrder(books || []);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load books for version", currVersion, e);
          setBooksOrder([]);
        }
      }
    })();

    // clear chapter cache when version changes
    setChaptersByBook({});
    setCurrBook({ id: null, name: "" });
    setCurrentChapterId(null);

    return () => {
      cancelled = true;
    };
  }, [currVersion]);

  // ---- Helper: fetch/load chapters for a given book ----
  const fetchChapters = useCallback(
    async (bookId) => {
      if (!bookId) return [];

      // If we already have them cached, reuse
      if (chaptersByBook[bookId]) {
        return chaptersByBook[bookId];
      }

      // KOREAN: use static chapter counts
      if (currVersion === "kor") {
        const count = KOR_CHAPTER_COUNTS[bookId] || 0;
        const list = Array.from({ length: count }, (_, i) => ({
          number: i + 1,
          id: `${bookId}.${i + 1}`,
        }));

        setChaptersByBook((prev) => ({
          ...prev,
          [bookId]: list,
        }));

        return list;
      }

      // Other versions: use api.scripture.api.bible
      const url = `https://api.scripture.api.bible/v1/bibles/${currVersion}/books/${bookId}/chapters`;

      try {
        const res = await fetch(url, {
          headers: { "api-key": API, accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const { data } = await res.json();
        const arr = (data || []).map(({ id, number }) => ({
          id,
          number,
        }));

        setChaptersByBook((prev) => ({
          ...prev,
          [bookId]: arr,
        }));

        return arr;
      } catch (e) {
        console.error("Failed to load chapters", { bookId, currVersion }, e);
        return [];
      }
    },
    [currVersion, chaptersByBook]
  );

  // Ensure current book's chapters are loaded when book changes
  useEffect(() => {
    if (currBook?.id) {
      fetchChapters(currBook.id);
    }
  }, [currBook?.id, fetchChapters]);

  // Current book's chapter list
  const currChapters = useMemo(() => {
    if (!currBook?.id) return [];
    return chaptersByBook[currBook.id] || [];
  }, [chaptersByBook, currBook?.id]);

  // Index of current chapter in that list
  const currChapterIndex = useMemo(() => {
    if (!currChapterId || !currChapters.length) return -1;
    return currChapters.findIndex((c) => c.id === currChapterId);
  }, [currChapters, currChapterId]);

  // Find book index in booksOrder
  const getBookIndex = useCallback(
    (bookId) => booksOrder.findIndex((b) => b.id === bookId),
    [booksOrder]
  );

  // Jump helpers
  const goToFirstChapterOf = useCallback(
    async (bookObj) => {
      const list = await fetchChapters(bookObj.id);
      if (list.length) {
        setCurrBook(bookObj);
        setCurrentChapterId(list[0].id);
      }
    },
    [fetchChapters]
  );

  const goToLastChapterOf = useCallback(
    async (bookObj) => {
      const list = await fetchChapters(bookObj.id);
      if (list.length) {
        setCurrBook(bookObj);
        setCurrentChapterId(list[list.length - 1].id);
      }
    },
    [fetchChapters]
  );

  // ---- Navigation: Next chapter / book ----
  const goNextChapter = useCallback(async () => {
    if (!currBook?.id) return;

    // 1) Next chapter in same book
    if (
      currChapterIndex >= 0 &&
      currChapterIndex < currChapters.length - 1
    ) {
      setCurrentChapterId(currChapters[currChapterIndex + 1].id);
      return;
    }

    // 2) We're at last chapter of this book → go to first chapter of next book
    const bi = getBookIndex(currBook.id);
    if (bi >= 0 && bi < booksOrder.length - 1) {
      const nextBook = booksOrder[bi + 1];
      await goToFirstChapterOf(nextBook);
    }
    // If bi is last index or -1 → no next book → do nothing
  }, [
    currBook,
    currChapters,
    currChapterIndex,
    booksOrder,
    getBookIndex,
    goToFirstChapterOf,
  ]);

  // ---- Navigation: Previous chapter / book ----
  const goPrevChapter = useCallback(async () => {
    if (!currBook?.id) return;

    // 1) Previous chapter in same book
    if (currChapterIndex > 0) {
      setCurrentChapterId(currChapters[currChapterIndex - 1].id);
      return;
    }

    // 2) We're at first chapter → go to last chapter of previous book
    const bi = getBookIndex(currBook.id);
    if (bi > 0) {
      const prevBook = booksOrder[bi - 1];
      await goToLastChapterOf(prevBook);
    }
    // If bi <= 0 → no previous book
  }, [
    currBook,
    currChapters,
    currChapterIndex,
    booksOrder,
    getBookIndex,
    goToLastChapterOf,
  ]);

  // ---- Arrow visibility ----
  const canPrev = useMemo(() => {
    if (!currBook?.id) return false;
    const bi = getBookIndex(currBook.id);
    return currChapterIndex > 0 || bi > 0;
  }, [currBook?.id, currChapterIndex, getBookIndex]);

  const canNext = useMemo(() => {
    if (!currBook?.id) return false;
    const bi = getBookIndex(currBook.id);
    return (
      (currChapterIndex >= 0 &&
        currChapterIndex < currChapters.length - 1) ||
      bi < booksOrder.length - 1
    );
  }, [
    currBook?.id,
    currChapterIndex,
    currChapters.length,
    getBookIndex,
    booksOrder.length,
  ]);

  return (
    <section className="ReadBible">
      <BibleVersion
        setChapter={setCurrentChapterId}
        book={currBook}
        setBook={(b) => {
          // selecting a new book from modal
          if (!b) {
            setCurrBook({ id: null, name: "" });
            setCurrentChapterId(null);
            return;
          }
          setCurrBook(b);
          setCurrentChapterId(null); // wait for chapter selection
        }}
        currVersionId={currVersion}
        setCurrentVersion={(v) => {
          setCurrVersion(v);
          // booksOrder + chaptersByBook are reset in the useEffect above
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
