import './Verse.css';
import { useEffect, useState } from 'react';
import API from "../../../component/Key";

const Verse = ({ chapterId, currVersionId , book}) => {
  const [verses, setVerses] = useState([]);
  const [verseTexts, setVerseTexts] = useState({}); // { [verseId]: text }
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1) Get the list of verses (ids + numbers)
  useEffect(() => {
    if (!currVersionId || !chapterId) return;
    const controller = new AbortController();

    (async () => {
      try {
        setError(null);
        setVerses([]);
        setVerseTexts({});
        setLoading(true);

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

  // 2) Automatically fetch the text for each verse id
  useEffect(() => {
    if (!currVersionId || verses.length === 0) return;
    const controller = new AbortController();

    (async () => {
      try {
        // naive fetch-all (fine for now; can batch/optimize later)
        const entries = await Promise.all(
          verses.map(async (v) => {
            const vUrl = new URL(
              `https://api.scripture.api.bible/v1/bibles/${currVersionId}/verses/${v.id}`
            );
            // choose text or html; using plain text per your request
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
            // data.text (plain) or data.content (html) depending on content-type
            const text = (data?.text ?? data?.content ?? "").toString().trim();
            return [v.id, text];
          })
        );

        // convert [id, text][] -> { id: text }
        const nextMap = Object.fromEntries(entries);
        setVerseTexts(nextMap);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load verse content");
      }
    })();

    return () => controller.abort();
  }, [currVersionId, verses]);

  if (error) return <div role="alert">Error: {error}</div>;
  if (loading && !verses.length) return <div>Loading verses…</div>;

  // show just the chapter number, not the book name
  const chapterNumber = chapterId?.split(".")[1] ?? "";

  return (
    <section className="DisplaySection">
      <h2 className="bookChapterHeader">
        {book} {chapterNumber}
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
      </div>
    </section>
  );
};

export default Verse;
