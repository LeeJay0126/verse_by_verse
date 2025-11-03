import { useEffect, useMemo, useState } from "react";
import API from "../../../component/Key";
import "../bibleVersions/IndividualVersion.css";

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
        const res = await fetch(
          `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books/${bibleBookID}/chapters`,
          { headers: { "api-key": API }, signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { data } = await res.json();
        const next = (data || []).map(({ number, id /*, reference, title*/ }) => ({
          number,
          id,
        }));
        setChapters(next);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Failed to load chapters");
      }
    })();

    return () => controller.abort();
  }, [bibleVersionID, bibleBookID]);

  // Filter by number (digits) or name-like phrases "chapter 3", "ch 3"
  const filteredChapters = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return chapters;

    // try to extract a number
    const numMatch = q.match(/\d+/);
    const num = numMatch ? Number(numMatch[0]) : null;

    return chapters.filter(({ number /*, title, reference*/ }) => {
      const label = `chapter ${number}`; // base "name" when no title/reference
      const matchesNumber = num ? String(number).includes(String(num)) : false;
      const matchesText = label.includes(q) /* || title?.toLowerCase().includes(q) || reference?.toLowerCase().includes(q) */;
      return matchesNumber || matchesText;
    });
  }, [chapters, filterText]);

  if (error) return <li role="alert">Error: {error}</li>;
  if (!chapters.length) return <li>Loading chapters…</li>;
  if (!filteredChapters.length) return <li>No chapters match your filter…</li>;

  return (
    <div>
      {filteredChapters.map(({ id, number }) => (
        <li className="bibleItem" key={id}
          onClick={() => onChapterSelect?.({ id, number })}>
          Chapter {number}
        </li>
      ))}
    </div>
  );
};

export default Chapter;
