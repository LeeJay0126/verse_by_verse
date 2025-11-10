import "./Verse.css";
import { useEffect, useState } from "react";
import API from "../../../component/Key";

const Verse = ({
  chapterId,
  currVersionId,
  book,
  onPrev,
  onNext,
  canPrev,
  canNext,
}) => {
  const [verses, setVerses] = useState([]);
  const [verseTexts, setVerseTexts] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const hasChapter = !!chapterId;

  // Fetch verses whenever version or chapter changes
  useEffect(() => {
    if (!currVersionId || !chapterId) return;

    const controller = new AbortController();

    (async () => {
      try {
        setError(null);
        setVerses([]);
        setVerseTexts({});
        setLoading(true);

        // ---------- KOREAN ----------
        if (currVersionId === "kor") {
          const res = await fetch(
            `/api/passage/${currVersionId}/${chapterId}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const data = await res.json();
          const list = Array.isArray(data.verses) ? data.verses : [];

          const normalized = list.map((v) => ({
            id: v.id,
            number: Number(v.number),
            text: (v.text || "").toString().trim(),
          }));

          setVerses(
            normalized.map((v) => ({
              id: v.id,
              number: v.number,
            }))
          );

          setVerseTexts(
            Object.fromEntries(normalized.map((v) => [v.id, v.text]))
          );

          return;
        }

        // ---------- NON-KOREAN ----------
        const url = new URL(
          `https://api.scripture.api.bible/v1/bibles/${currVersionId}/chapters/${chapterId}/verses`
        );
        url.searchParams.set("content-type", "json");
        url.searchParams.set("include-verse-numbers", "true");
        url.searchParams.set("include-verse-spans", "true");

        const res = await fetch(url.toString(), {
          headers: {
            "api-key": API,
            accept: "application/json",
          },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const { data } = await res.json();
        const raw = Array.isArray(data) ? data : [];

        const withNumbers = raw.map((v, index) => {
          let num = index + 1;

          if (v.reference) {
            const parts = v.reference.split(":");
            const last = parts[parts.length - 1];
            const parsed = parseInt(last, 10);
            if (!isNaN(parsed)) num = parsed;
          }

          return { ...v, number: num };
        });

        setVerses(
          withNumbers.map((v) => ({
            id: v.id,
            number: v.number,
          }))
        );

        const entries = await Promise.all(
          withNumbers.map(async (v) => {
            const vUrl = new URL(
              `https://api.scripture.api.bible/v1/bibles/${currVersionId}/verses/${v.id}`
            );
            vUrl.searchParams.set("content-type", "text");
            vUrl.searchParams.set("include-verse-numbers", "false");
            vUrl.searchParams.set("include-notes", "false");
            vUrl.searchParams.set("include-titles", "false");

            const r = await fetch(vUrl.toString(), {
              headers: {
                "api-key": API,
                accept: "application/json",
              },
              signal: controller.signal,
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);

            const { data } = await r.json();
            const text = (data?.text ?? data?.content ?? "")
              .toString()
              .trim();

            return [v.id, text];
          })
        );

        setVerseTexts(Object.fromEntries(entries));
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError(e.message || "Failed to load verses");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [currVersionId, chapterId]);

  // Keyboard navigation for chapters (only when a chapter is active)
  useEffect(() => {
    if (!hasChapter) return;

    const onKeyDown = (e) => {
      const el = e.target;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);
      if (typing) return;

      if (e.key === "ArrowLeft" && canPrev) {
        e.preventDefault();
        onPrev?.();
      }
      if (e.key === "ArrowRight" && canNext) {
        e.preventDefault();
        onNext?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasChapter, canPrev, canNext, onPrev, onNext]);

  const chapterNumber = hasChapter ? (chapterId.split(".")[1] || "") : "";

  // Pair verses visually: 2 verses per line
  const pairedVerses = [];
  for (let i = 0; i < verses.length; i += 2) {
    pairedVerses.push([verses[i], verses[i + 1]]);
  }

  const showArrows = hasChapter && (canPrev || canNext);

  return (
    <section className="DisplaySection">
      <h2 className="bookChapterHeader">
        {hasChapter ? (
          <span className="chapterTitle">
            {book?.name || ""} {chapterNumber}
          </span>
        ) : (
          <span className="chapterTitle placeholder">
            Select a book and chapter to begin.
          </span>
        )}
      </h2>

      <div className="displayArea">
        {/* Content state */}
        {error && hasChapter && (
          <div role="alert">Error: {error}</div>
        )}

        {loading && hasChapter && !verses.length && (
          <div>Loading verses…</div>
        )}

        {hasChapter && !loading && !error && (
          <ol className="versesList">
            {pairedVerses.map(([v1, v2], idx) => (
              <li key={v1?.id || idx} className="verseRowPair">
                {v1 && (
                  <span className="verseChunk">
                    <sup className="verseNum">{v1.number}</sup>
                    {verseTexts[v1.id] ?? ""}
                  </span>
                )}
                {v2 && (
                  <span className="verseChunk">
                    <sup className="verseNum">{v2.number}</sup>
                    {verseTexts[v2.id] ?? ""}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}

        {/* Arrows: only when a chapter exists & nav is possible */}
        {showArrows && (
          <section className="chapterNav">
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
        )}
      </div>
    </section>
  );
};

export default Verse;
