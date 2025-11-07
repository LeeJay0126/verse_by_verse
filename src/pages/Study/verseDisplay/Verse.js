import './Verse.css';
import { useEffect, useState } from 'react';
import API from "../../../component/Key";

const Verse = ({ chapterId, currVersionId, book, onPrev, onNext, canPrev, canNext }) => {
  const [verses, setVerses] = useState([]);
  const [verseTexts, setVerseTexts] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1) Load verse list (or full chapter for KOR)
  useEffect(() => {
    if (!currVersionId || !chapterId) return;
    const controller = new AbortController();

    (async () => {
      try {
        setError(null);
        setVerses([]);
        setVerseTexts({});
        setLoading(true);

        // KOR: fetch from ibibles.net
        if (currVersionId === 'kor') {
          const [bookCode, chapterNumber] = (chapterId || "").split(".");
          if (!bookCode || !chapterNumber) {
            throw new Error("Invalid KOR chapter id");
          }

          const res = await fetch(
            `/api/kor/${bookCode}/${chapterNumber}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const html = await res.text();
          const text = html
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          const id = `${bookCode}.${chapterNumber}.1`;
          setVerses([{ id }]);
          setVerseTexts({ [id]: text });
          setLoading(false);
          return;
        }


        // Default: Scripture API (other versions)
        const url = new URL(
          `https://api.scripture.api.bible/v1/bibles/${currVersionId}/chapters/${chapterId}/verses`
        );
        url.searchParams.set("content-type", "json");
        url.searchParams.set("include-verse-numbers", "true");
        url.searchParams.set("include-verse-spans", "true");

        const res = await fetch(url.toString(), {
          headers: { "api-key": API, "accept": "application/json" },
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { data } = await res.json();
        setVerses(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load verses");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [currVersionId, chapterId]);

  // 2) Load verse texts for non-KOR
  useEffect(() => {
    if (!currVersionId || currVersionId === 'kor' || verses.length === 0) return;
    const controller = new AbortController();

    (async () => {
      try {
        const entries = await Promise.all(
          verses.map(async (v) => {
            const vUrl = new URL(
              `https://api.scripture.api.bible/v1/bibles/${currVersionId}/verses/${v.id}`
            );
            vUrl.searchParams.set("content-type", "text");
            vUrl.searchParams.set("include-verse-numbers", "false");
            vUrl.searchParams.set("include-notes", "false");
            vUrl.searchParams.set("include-titles", "false");

            const r = await fetch(vUrl.toString(), {
              headers: { "api-key": API, "accept": "application/json" },
              signal: controller.signal
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const { data } = await r.json();
            const text = (data?.text ?? data?.content ?? "").toString().trim();
            return [v.id, text];
          })
        );
        setVerseTexts(Object.fromEntries(entries));
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load verse content");
      }
    })();

    return () => controller.abort();
  }, [currVersionId, verses]);

  // Keyboard nav
  useEffect(() => {
    const onKeyDown = (e) => {
      const el = e.target;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (typing) return;

      if (e.key === "ArrowLeft" && canPrev) { e.preventDefault(); onPrev?.(); }
      if (e.key === "ArrowRight" && canNext) { e.preventDefault(); onNext?.(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canPrev, canNext, onPrev, onNext]);

  if (error) return <div role="alert">Error: {error}</div>;
  if (loading && !verses.length) return <div>Loading verses…</div>;

  const chapterNumber = chapterId?.split(".")[1] ?? "";

  return (
    <section className="DisplaySection">
      <h2 className="bookChapterHeader">
        <span className="chapterTitle">
          {book?.name || ""} {chapterNumber}
        </span>
      </h2>

      <div className="displayArea">
        <ol className="versesList">
          {verses.map((v) => (
            <li key={v.id} className="verseRow">
              <span className="verseText">
                {verseTexts[v.id] ?? "Loading…"}
              </span>
            </li>
          ))}
        </ol>

        <section className='chapterNav'>
          {canPrev && (
            <button
              className="navArrow navArrowLeft"
              onClick={onPrev}
              aria-label="Previous chapter"
            >
              ←
            </button>
          )}
          {canNext && (
            <button
              className="navArrow navArrowRight"
              onClick={onNext}
              aria-label="Next chapter"
            >
              →
            </button>
          )}
        </section>
      </div>
    </section>
  );
};

export default Verse;
