import { useEffect, useMemo, useRef, useState } from "react";
import API from "../../../../component/Key";
import GetBookVersions from "../../../Study/bookVersions/GetBookVersions";
import getBibleVersions from "../../../Study/bibleVersions/GetBibleVersions";

const DEFAULT_VERSION = {
  id: "06125adad2d5898a-01",
  abbreviation: "ASV",
  name: "American Standard Version",
};

const KOR_VERSION = {
  id: "kor",
  abbreviation: "KOR",
  name: "Korean 한국어 성경",
};

const ALLOWED_ABBREVIATIONS = new Set(["ASV", "BSB", "engKJV", "WEB", "FBV"]);

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
  phi: 4, col: 4, "1th": 5, "2th": 3, "1tim": 6,
  "2tim": 4, titus: 3, phmn: 1, heb: 13, jas: 5,
  "1pet": 5, "2pet": 3, "1jn": 5, "2jn": 1, "3jn": 1,
  jude: 1, rev: 22,
};

const normalizeText = (value) => (value || "").toString().replace(/\s+/g, " ").trim();

const buildRangeLabel = (chapterNumber, start, end, minVerse, maxVerse) => {
  if (!chapterNumber) return "";
  if (start == null || end == null) return `${chapterNumber}`;

  const isFullChapter = Number(start) === Number(minVerse) && Number(end) === Number(maxVerse);
  if (isFullChapter) return `${chapterNumber}`;
  if (Number(start) === Number(end)) return `${chapterNumber}:${start}`;
  return `${chapterNumber}:${start}-${end}`;
};

const fetchChapters = async (versionId, bookId) => {
  if (!versionId || !bookId) return [];

  if (versionId === "kor") {
    const count = KOR_CHAPTER_COUNTS[bookId] || 0;
    return Array.from({ length: count }, (_, index) => ({
      id: `${bookId}.${index + 1}`,
      number: index + 1,
    }));
  }

  const res = await fetch(
    `https://api.scripture.api.bible/v1/bibles/${versionId}/books/${bookId}/chapters`,
    {
      headers: {
        "api-key": API,
        accept: "application/json",
      },
    }
  );

  if (!res.ok) throw new Error(`Failed to load chapters (${res.status})`);
  const json = await res.json();
  return (json.data || []).map(({ id, number }) => ({
    id,
    number: Number(number),
  }));
};

const fetchVerses = async (versionId, chapterId) => {
  if (!versionId || !chapterId) return [];

  if (versionId === "kor") {
    const res = await fetch(`/api/passage/${versionId}/${chapterId}`);
    if (!res.ok) throw new Error(`Failed to load verses (${res.status})`);
    const data = await res.json();
    return Array.isArray(data.verses)
      ? data.verses.map((v) => ({
          id: v.id,
          number: Number(v.number),
          text: normalizeText(v.text),
        }))
      : [];
  }

  const listUrl = new URL(
    `https://api.scripture.api.bible/v1/bibles/${versionId}/chapters/${chapterId}/verses`
  );
  listUrl.searchParams.set("content-type", "json");
  listUrl.searchParams.set("include-verse-numbers", "true");
  listUrl.searchParams.set("include-verse-spans", "true");

  const res = await fetch(listUrl.toString(), {
    headers: {
      "api-key": API,
      accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(`Failed to load verses (${res.status})`);

  const json = await res.json();
  const raw = Array.isArray(json.data) ? json.data : [];

  const numbered = raw.map((item, index) => {
    let number = index + 1;
    if (item.reference) {
      const parts = item.reference.split(":");
      const maybe = parseInt(parts[parts.length - 1], 10);
      if (!Number.isNaN(maybe)) number = maybe;
    }
    return {
      id: item.id,
      number,
    };
  });

  const entries = await Promise.all(
    numbered.map(async (verse) => {
      const verseUrl = new URL(
        `https://api.scripture.api.bible/v1/bibles/${versionId}/verses/${verse.id}`
      );
      verseUrl.searchParams.set("content-type", "text");
      verseUrl.searchParams.set("include-verse-numbers", "false");
      verseUrl.searchParams.set("include-notes", "false");
      verseUrl.searchParams.set("include-titles", "false");

      const textRes = await fetch(verseUrl.toString(), {
        headers: {
          "api-key": API,
          accept: "application/json",
        },
      });

      if (!textRes.ok) throw new Error(`Failed to load verse text (${textRes.status})`);

      const textJson = await textRes.json();
      const text = normalizeText(textJson?.data?.text ?? textJson?.data?.content ?? "");
      return {
        ...verse,
        text,
      };
    })
  );

  return entries;
};

const BibleStudyPassagePicker = ({ initialValue = null, onChange }) => {
  const [versionOptions, setVersionOptions] = useState([DEFAULT_VERSION, KOR_VERSION]);
  const [versionId, setVersionId] = useState(DEFAULT_VERSION.id);
  const [versionLabel, setVersionLabel] = useState(DEFAULT_VERSION.abbreviation);

  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState("");
  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState("");
  const [chapterNumber, setChapterNumber] = useState(null);

  const [verses, setVerses] = useState([]);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  const [loadingVersions, setLoadingVersions] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [error, setError] = useState("");

  const hydratedInitialRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadingVersions(true);
        const versionList = await getBibleVersions;
        if (cancelled) return;

        const filtered = (versionList || []).filter((version) =>
          ALLOWED_ABBREVIATIONS.has(version.abbreviation || version.id)
        );

        const deduped = [];
        const seen = new Set();

        [DEFAULT_VERSION, ...filtered, KOR_VERSION].forEach((version) => {
          const key = version.id;
          if (!key || seen.has(key)) return;
          seen.add(key);
          deduped.push(version);
        });

        setVersionOptions(deduped);

        const targetVersionId = initialValue?.versionId || DEFAULT_VERSION.id;
        const current = deduped.find((item) => item.id === targetVersionId) || DEFAULT_VERSION;

        setVersionId(current.id);
        setVersionLabel(
          initialValue?.versionLabel || current.abbreviation || current.id
        );
      } catch (e) {
        if (!cancelled) {
          setVersionOptions([DEFAULT_VERSION, KOR_VERSION]);
          setVersionId(initialValue?.versionId || DEFAULT_VERSION.id);
          setVersionLabel(initialValue?.versionLabel || DEFAULT_VERSION.abbreviation);
        }
      } finally {
        if (!cancelled) setLoadingVersions(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialValue]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadingBooks(true);
        setError("");
        setBooks([]);
        setBookId("");
        setChapters([]);
        setChapterId("");
        setChapterNumber(null);
        setVerses([]);
        setRangeStart(null);
        setRangeEnd(null);

        const result = await GetBookVersions(versionId);
        if (cancelled) return;

        const nextBooks = Array.isArray(result) ? result : [];
        setBooks(nextBooks);

        if (!hydratedInitialRef.current && initialValue?.bookId) {
          setBookId(initialValue.bookId);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Failed to load books.");
        }
      } finally {
        if (!cancelled) setLoadingBooks(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [versionId, initialValue]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!bookId) {
        setChapters([]);
        setChapterId("");
        setChapterNumber(null);
        setVerses([]);
        setRangeStart(null);
        setRangeEnd(null);
        return;
      }

      try {
        setLoadingChapters(true);
        setError("");
        setChapters([]);
        setChapterId("");
        setChapterNumber(null);
        setVerses([]);
        setRangeStart(null);
        setRangeEnd(null);

        const result = await fetchChapters(versionId, bookId);
        if (cancelled) return;

        const nextChapters = Array.isArray(result) ? result : [];
        setChapters(nextChapters);

        if (!hydratedInitialRef.current && initialValue?.chapterId) {
          const initialChapter = nextChapters.find(
            (chapter) => String(chapter.id) === String(initialValue.chapterId)
          );
          setChapterId(initialValue.chapterId);
          setChapterNumber(initialChapter?.number ?? initialValue?.chapterNumber ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Failed to load chapters.");
        }
      } finally {
        if (!cancelled) setLoadingChapters(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [versionId, bookId, initialValue]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!chapterId) {
        setVerses([]);
        setRangeStart(null);
        setRangeEnd(null);
        return;
      }

      try {
        setLoadingVerses(true);
        setError("");
        setVerses([]);
        setRangeStart(null);
        setRangeEnd(null);

        const result = await fetchVerses(versionId, chapterId);
        if (cancelled) return;

        const safeVerses = Array.isArray(result) ? result : [];
        setVerses(safeVerses);

        const numbers = safeVerses.map((v) => Number(v.number)).filter((n) => !Number.isNaN(n));
        const minVerse = numbers[0] ?? null;
        const maxVerse = numbers[numbers.length - 1] ?? null;

        if (!hydratedInitialRef.current && initialValue?.rangeStart != null && initialValue?.rangeEnd != null) {
          setRangeStart(initialValue.rangeStart);
          setRangeEnd(initialValue.rangeEnd);
          hydratedInitialRef.current = true;
        } else {
          setRangeStart(minVerse);
          setRangeEnd(maxVerse);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Failed to load verses.");
        }
      } finally {
        if (!cancelled) setLoadingVerses(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [versionId, chapterId, initialValue]);

  const selectedBook = useMemo(
    () => books.find((book) => String(book.id) === String(bookId)) || null,
    [books, bookId]
  );

  const verseNumbers = useMemo(() => {
    return verses
      .map((v) => Number(v.number))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
  }, [verses]);

  const minVerse = verseNumbers[0] ?? null;
  const maxVerse = verseNumbers[verseNumbers.length - 1] ?? null;

  const visibleVerses = useMemo(() => {
    if (rangeStart == null || rangeEnd == null) return verses;
    const start = Math.min(Number(rangeStart), Number(rangeEnd));
    const end = Math.max(Number(rangeStart), Number(rangeEnd));
    return verses.filter((verse) => verse.number >= start && verse.number <= end);
  }, [verses, rangeStart, rangeEnd]);

  const referenceLabel = useMemo(() => {
    if (!selectedBook || !chapterNumber) return "";
    const chapterLabel = buildRangeLabel(chapterNumber, rangeStart, rangeEnd, minVerse, maxVerse);
    return `${selectedBook.name} ${chapterLabel}`.trim();
  }, [selectedBook, chapterNumber, rangeStart, rangeEnd, minVerse, maxVerse]);

  useEffect(() => {
    onChange?.({
      versionId,
      versionLabel,
      bookId: selectedBook?.id || "",
      bookName: selectedBook?.name || "",
      chapterId: chapterId || "",
      chapterNumber: chapterNumber || null,
      rangeStart: rangeStart ?? null,
      rangeEnd: rangeEnd ?? null,
      referenceLabel,
      verses: visibleVerses.map((verse) => ({
        number: verse.number,
        text: verse.text,
      })),
    });
  }, [
    onChange,
    versionId,
    versionLabel,
    selectedBook,
    chapterId,
    chapterNumber,
    rangeStart,
    rangeEnd,
    referenceLabel,
    visibleVerses,
  ]);

  const handleVersionChange = (e) => {
    const nextId = e.target.value;
    const next = versionOptions.find((option) => String(option.id) === String(nextId));
    hydratedInitialRef.current = true;
    setVersionId(nextId);
    setVersionLabel(next?.abbreviation || next?.id || "");
  };

  const handleBookChange = (e) => {
    hydratedInitialRef.current = true;
    setBookId(e.target.value);
  };

  const handleChapterChange = (e) => {
    const nextId = e.target.value;
    const next = chapters.find((chapter) => String(chapter.id) === String(nextId)) || null;
    hydratedInitialRef.current = true;
    setChapterId(nextId);
    setChapterNumber(next?.number ?? null);
  };

  return (
    <section className="BibleStudyComposerCard">
      <div className="BibleStudyComposerCardHeader">
        <h2>Passage</h2>
        <p>Select the Bible version, book, chapter, and verse range.</p>
      </div>

      {error && <div className="BibleStudyComposerError">{error}</div>}

      <div className="BibleStudyPassageGrid">
        <div className="BibleStudyField">
          <label>Version</label>
          <select value={versionId} onChange={handleVersionChange} disabled={loadingVersions}>
            {versionOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {(option.abbreviation || option.id) + " - " + option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="BibleStudyField">
          <label>Book</label>
          <select
            value={bookId}
            onChange={handleBookChange}
            disabled={loadingBooks || !books.length}
          >
            <option value="">Select book</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name}
              </option>
            ))}
          </select>
        </div>

        <div className="BibleStudyField">
          <label>Chapter</label>
          <select
            value={chapterId}
            onChange={handleChapterChange}
            disabled={loadingChapters || !chapters.length}
          >
            <option value="">Select chapter</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.number}
              </option>
            ))}
          </select>
        </div>

        <div className="BibleStudyField">
          <label>Start verse</label>
          <select
            value={rangeStart ?? ""}
            onChange={(e) => {
              hydratedInitialRef.current = true;
              setRangeStart(Number(e.target.value));
            }}
            disabled={loadingVerses || !verseNumbers.length}
          >
            {verseNumbers.map((number) => (
              <option key={`start-${number}`} value={number}>
                {number}
              </option>
            ))}
          </select>
        </div>

        <div className="BibleStudyField">
          <label>End verse</label>
          <select
            value={rangeEnd ?? ""}
            onChange={(e) => {
              hydratedInitialRef.current = true;
              setRangeEnd(Number(e.target.value));
            }}
            disabled={loadingVerses || !verseNumbers.length}
          >
            {verseNumbers
              .filter((number) => rangeStart == null || number >= Number(rangeStart))
              .map((number) => (
                <option key={`end-${number}`} value={number}>
                  {number}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="BibleStudyReferenceBar">
        <strong>Selected reference:</strong>
        <span>{referenceLabel || "Select a passage to preview it here."}</span>
      </div>

      <div className="BibleStudyVersePreview">
        {loadingVerses && <p>Loading passage…</p>}

        {!loadingVerses && !visibleVerses.length && (
          <p>Select a chapter to preview the passage.</p>
        )}

        {!loadingVerses && !!visibleVerses.length && (
          <>
            <div className="BibleStudyVersePreviewMeta">
              {visibleVerses.length} verse{visibleVerses.length === 1 ? "" : "s"} selected
            </div>

            <div className="BibleStudyVerseList">
              {visibleVerses.map((verse) => (
                <p key={`${chapterId}-${verse.number}`} className="BibleStudyVerseItem">
                  <sup>{verse.number}</sup> {verse.text}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BibleStudyPassagePicker;