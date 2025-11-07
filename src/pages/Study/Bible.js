import { useEffect, useState, useCallback, useMemo } from "react";
import API from "../../component/Key";
import GetBookVersions from "./bookVersions/GetBookVersions";
import BibleVersion from "./bibleVersions/BibleVersions";
import Verse from "./verseDisplay/Verse";

// KOR chapter counts keyed by ibibles-style codes
const KOR_CHAPTER_COUNTS = {
  gen: 50,
  exo: 40,
  lev: 27,
  num: 36,
  deu: 34,
  jos: 24,
  jdg: 21,
  rut: 4,
  "1sa": 31,
  "2sa": 24,
  "1ki": 22,
  "2ki": 25,
  "1ch": 29,
  "2ch": 36,
  ezr: 10,
  neh: 13,
  est: 10,
  job: 42,
  psa: 150,
  pro: 31,
  ecc: 12,
  sng: 8,
  isa: 66,
  jer: 52,
  lam: 5,
  eze: 48,
  dan: 12,
  hos: 14,
  joe: 3,
  amo: 9,
  oba: 1,
  jon: 4,
  mic: 7,
  nah: 3,
  hab: 3,
  zep: 3,
  hag: 2,
  zec: 14,
  mal: 4,
  mat: 28,
  mrk: 16,
  luk: 24,
  jhn: 21,
  act: 28,
  rom: 16,
  "1co": 16,
  "2co": 13,
  gal: 6,
  eph: 6,
  php: 4,
  col: 4,
  "1th": 5,
  "2th": 3,
  "1ti": 6,
  "2ti": 4,
  tit: 3,
  phm: 1,
  heb: 13,
  jas: 5,
  "1pe": 5,
  "2pe": 3,
  "1jn": 5,
  "2jn": 1,
  "3jn": 1,
  jud: 1,
  rev: 22,
};

const Bible = () => {
  const [currVersionId, setCurrVersionId] = useState("06125adad2d5898a-01"); // ASV
  const [currBook, setCurrBook] = useState({ id: null, name: "" });
  const [currChapterId, setCurrChapterId] = useState(null); // e.g. "GEN.1" or "gen.1"

  const [booksOrder, setBooksOrder] = useState([]);          // [{ id, name }]
  const [chaptersByBook, setChaptersByBook] = useState({});  // { [bookId]: [{id, number}] }

  // 1) Load books list whenever version changes
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const books = await GetBookVersions(currVersionId);
        if (!cancelled) {
          setBooksOrder(books || []);
        }
      } catch (err) {
        console.error("Failed to load books for version", currVersionId, err);
        if (!cancelled) setBooksOrder([]);
      }
    })();

    // reset selection when version changes
    setCurrBook({ id: null, name: "" });
    setCurrChapterId(null);
    setChaptersByBook({});

    return () => {
      cancelled = true;
    };
  }, [currVersionId]);

  // 2) Fetch chapters for a given book (memoized to avoid infinite loops)
  const fetchChapters = useCallback(
    async (bookId) => {
      if (!bookId) return [];

      // if we already have chapters cached, just return them
      if (chaptersByBook[bookId]) {
        return chaptersByBook[bookId];
      }

      // KOR: generate from static counts
      if (currVersionId === "kor") {
        const count = KOR_CHAPTER_COUNTS[bookId] || 0;
        const list = Array.from({ length: count }, (_, i) => ({
          number: i + 1,
          id: `${bookId}.${i + 1}`,
        }));
        setChaptersByBook((prev) => ({ ...prev, [bookId]: list }));
        return list;
      }

      // Other versions: hit api.bible
      try {
        const res = await fetch(
          `https://api.scripture.api.bible/v1/bibles/${currVersionId}/books/${bookId}/chapters`,
          { headers: { "api-key": API } }
        );
        if (!res.ok) {
          console.error("Chapters fetch failed", res.status, bookId);
          return [];
        }
        const { data } = await res.json();
        const list = (data || []).map(({ id, number }) => ({ id, number }));
        setChaptersByBook((prev) => ({ ...prev, [bookId]: list }));
        return list;
      } catch (err) {
        console.error("Chapters fetch error", err);
        return [];
      }
    },
    [currVersionId, chaptersByBook]
  );

  // 3) When current book changes, ensure its chapters are loaded once
  useEffect(() => {
    if (currBook?.id) {
      fetchChapters(currBook.id);
    }
  }, [currBook?.id, fetchChapters]);

  // 4) Helpers for current chapter + book indices
  const currChapters = useMemo(
    () => (currBook?.id ? chaptersByBook[currBook.id] || [] : []),
    [chaptersByBook, currBook?.id]
  );

  const currChapterIndex = useMemo(
    () => currChapters.findIndex((c) => c.id === currChapterId),
    [currChapters, currChapterId]
  );

  const getBookIndex = useCallback(
    (bookId) => booksOrder.findIndex((b) => b.id === bookId),
    [booksOrder]
  );

  // 5) Navigation helpers
  const goToFirstChapterOf = useCallback(
    async (bookObj) => {
      if (!bookObj) return;
      const list = await fetchChapters(bookObj.id);
      if (list.length) {
        setCurrBook(bookObj);
        setCurrChapterId(list[0].id);
      }
    },
    [fetchChapters]
  );

  const goToLastChapterOf = useCallback(
    async (bookObj) => {
      if (!bookObj) return;
      const list = await fetchChapters(bookObj.id);
      if (list.length) {
        setCurrBook(bookObj);
        setCurrChapterId(list[list.length - 1].id);
      }
    },
    [fetchChapters]
  );

  const goNextChapter = useCallback(async () => {
    if (!currBook?.id) return;

    // within same book
    if (
      currChapterIndex >= 0 &&
      currChapterIndex < currChapters.length - 1
    ) {
      setCurrChapterId(currChapters[currChapterIndex + 1].id);
      return;
    }

    // go to first chapter of next book
    const bi = getBookIndex(currBook.id);
    if (bi >= 0 && bi < booksOrder.length - 1) {
      const nextBook = booksOrder[bi + 1];
      await goToFirstChapterOf(nextBook);
    }
  }, [
    currBook,
    currChapters,
    currChapterIndex,
    booksOrder,
    getBookIndex,
    goToFirstChapterOf,
  ]);

  const goPrevChapter = useCallback(async () => {
    if (!currBook?.id) return;

    // within same book
    if (currChapterIndex > 0) {
      setCurrChapterId(currChapters[currChapterIndex - 1].id);
      return;
    }

    // go to last chapter of previous book
    const bi = getBookIndex(currBook.id);
    if (bi > 0) {
      const prevBook = booksOrder[bi - 1];
      await goToLastChapterOf(prevBook);
    }
  }, [
    currBook,
    currChapters,
    currChapterIndex,
    booksOrder,
    getBookIndex,
    goToLastChapterOf,
  ]);

  // 6) Arrow visibility
  const canPrev =
    !!currBook?.id &&
    ((currChapterIndex > 0) || getBookIndex(currBook.id) > 0);

  const canNext =
    !!currBook?.id &&
    (
      (currChapterIndex >= 0 &&
        currChapterIndex < currChapters.length - 1) ||
      getBookIndex(currBook.id) < booksOrder.length - 1
    );

  // 7) Render
  return (
    <section className="ReadBible">
      <BibleVersion
        setChapter={setCurrChapterId}
        book={currBook}
        setBook={(b) => {
          // b is {id, name} from modal, or null when cleared
          setCurrBook(b || { id: null, name: "" });
          setCurrChapterId(null);
        }}
        currVersionId={currVersionId}
        setCurrentVersion={(v) => {
          setCurrVersionId(v);
          // the effect on currVersionId will handle clearing state
        }}
      />

      <Verse
        chapterId={currChapterId}
        currVersionId={currVersionId}
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
