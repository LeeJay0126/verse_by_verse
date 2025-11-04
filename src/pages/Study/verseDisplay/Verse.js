import './Verse.css';
import { useEffect, useState } from 'react';
import API from "../../../component/Key";

const Verse = ({ chapterId, currVersionId, book }) => {
    /*
        bookChapterHeader is a combination of Book version
        + Chapter 
    */
    const [verses, setVerses] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currVersionId || !chapterId) return;
        const controller = new AbortController();
        (async () => {
            try {
                setError(null);
                setVerses([]);
                const url = new URL(
                    `https://api.scripture.api.bible/v1/bibles/${currVersionId}/chapters/${chapterId}/verses`
                );
                console.log(url);
                // Optional display options:
                url.searchParams.set("content-type", "json");           // or "html"
                url.searchParams.set("include-verse-numbers", "true");
                url.searchParams.set("include-verse-spans", "true");
                // If you’re returning text/html content later, consider FUMS v3:
                // url.searchParams.set("fums-version", "3");

                const res = await fetch(url.toString(), {
                    headers: { "api-key": API, "accept": "application/json" },
                    signal: controller.signal
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const { data } = await res.json();
                // `data` is an array of verse objects; each typically has id like "GEN.1.1"
                setVerses(Array.isArray(data) ? data : []);
            } catch (e) {
                if (e.name !== "AbortError") setError(e.message || "Failed to load verses");
            }
        })();
        return () => controller.abort();
    }, [currVersionId, chapterId]);

    if (error) return <div role="alert">Error: {error}</div>;
    if (!verses.length) return <div>Loading verses…</div>;

    return (
        <section className="DisplaySection">
            <h2 className="bookChapterHeader">
                {book} {chapterId}
            </h2>
            <div className="displayArea">
                <ul>
                    {verses.map(v => (
                        <li key={v.id}>
                            Verse {v.verseNumber ?? v.reference ?? v.id}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default Verse;