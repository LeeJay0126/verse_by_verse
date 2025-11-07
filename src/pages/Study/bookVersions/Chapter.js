import { useEffect, useMemo, useState } from "react";
import API from "../../../component/Key";
import "../bibleVersions/IndividualVersion.css";

// Static chapter counts for KOR (ibibles.net style ids)
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

const Chapter = ({ version: bibleVersionID, book: bibleBookID, filterText = "", onChapterSelect }) => {
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bibleVersionID || !bibleBookID) return;
    const controller = new AbortController();

    (async () => {
      try {
        setError(null);
        setChapters([]);

        // Special case: Korean KOR version uses static chapter counts
        if (bibleVersionID === "kor") {
          const count = KOR_CHAPTER_COUNTS[bibleBookID] || 0;
          if (!count) {
            setError("No chapter data for this book.");
            return;
          }
          const list = Array.from({ length: count }, (_, i) => ({
            number: i + 1,
            id: `${bibleBookID}.${i + 1}`,
          }));
          setChapters(list);
          return;
        }

        // Default: Scripture API for other versions
        const res = await fetch(
          `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books/${bibleBookID}/chapters`,
          { headers: { "api-key": API }, signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { data } = await res.json();
        const next = (data || []).map(({ number, id }) => ({
          number,
          id,
        }));
        setChapters(next);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load chapters");
        }
      }
    })();

    return () => controller.abort();
  }, [bibleVersionID, bibleBookID]);

  // Filter by number or "ch 3", etc.
  const filteredChapters = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return chapters;

    const numMatch = q.match(/\d+/);
    const num = numMatch ? Number(numMatch[0]) : null;

    return chapters.filter(({ number }) => {
      const label = `chapter ${number}`;
      const matchesNumber = num ? String(number).includes(String(num)) : false;
      const matchesText = label.includes(q);
      return matchesNumber || matchesText;
    });
  }, [chapters, filterText]);

  if (error) return <li role="alert">Error: {error}</li>;
  if (!chapters.length) return <li>Loading chapters…</li>;
  if (!filteredChapters.length) return <li>No chapters match your filter…</li>;

  return (
    <div>
      {filteredChapters.map(({ id, number }) => (
        <li
          className="bibleItem"
          key={id}
          onClick={() => onChapterSelect?.({ id, number })}
        >
          Chapter {number}
        </li>
      ))}
    </div>
  );
};

export default Chapter;
