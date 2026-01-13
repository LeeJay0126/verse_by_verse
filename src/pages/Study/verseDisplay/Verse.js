import "./Verse.css";
import { useEffect, useMemo, useState } from "react";
import API from "../../../component/Key";
import { useAuth } from "../../../component/context/AuthContext";
import { useNotesApi } from "../Notes/useNotesApi";

const Verse = ({
  chapterId,
  currVersionId,
  book,
  onPrev,
  onNext,
  canPrev,
  canNext,
  isNotesOpen,
  setIsNotesOpen,
  getChapterNote,
  saveChapterNote,
  requireAuthForNotes,
  passageRange,
}) => {
  const { user, initializing } = useAuth();

  const [verses, setVerses] = useState([]);
  const [verseTexts, setVerseTexts] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [noteDraft, setNoteDraft] = useState("");
  const [noteTitleDraft, setNoteTitleDraft] = useState("");

  const [activeRange, setActiveRange] = useState(null);

  const [rangeModalOpen, setRangeModalOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [rangeAnchor, setRangeAnchor] = useState(null);

  const hasChapter = !!chapterId;
  const chapterNumber = hasChapter ? (chapterId.split(".")[1] || "") : "";

  const noteKey = useMemo(() => {
    const bibleId = currVersionId || "";
    const chap = chapterId || "";
    const rs = activeRange?.start ?? "";
    const re = activeRange?.end ?? "";
    return `${bibleId}::${chap}::${rs}::${re}`;
  }, [currVersionId, chapterId, activeRange]);

  const { createNote } = useNotesApi();

  useEffect(() => {
    if (!currVersionId || !chapterId) return;

    const controller = new AbortController();

    (async () => {
      try {
        setError(null);
        setVerses([]);
        setVerseTexts({});
        setLoading(true);

        setActiveRange(null);
        setRangeModalOpen(false);
        setRangeStart(null);
        setRangeEnd(null);
        setRangeAnchor(null);
        setIsNotesOpen?.(false);

        if (currVersionId === "kor") {
          const res = await fetch(`/api/passage/${currVersionId}/${chapterId}`, {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const data = await res.json();
          const list = Array.isArray(data.verses) ? data.verses : [];

          const normalized = list.map((v) => ({
            id: v.id,
            number: Number(v.number),
            text: (v.text || "").toString().trim(),
          }));

          setVerses(normalized.map((v) => ({ id: v.id, number: v.number })));
          setVerseTexts(Object.fromEntries(normalized.map((v) => [v.id, v.text])));
          return;
        }

        const url = new URL(
          `https://api.scripture.api.bible/v1/bibles/${currVersionId}/chapters/${chapterId}/verses`
        );
        url.searchParams.set("content-type", "json");
        url.searchParams.set("include-verse-numbers", "true");
        url.searchParams.set("include-verse-spans", "true");

        const res = await fetch(url.toString(), {
          headers: { "api-key": API, accept: "application/json" },
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

        setVerses(withNumbers.map((v) => ({ id: v.id, number: v.number })));

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
              headers: { "api-key": API, accept: "application/json" },
              signal: controller.signal,
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);

            const { data } = await r.json();
            const text = (data?.text ?? data?.content ?? "").toString().trim();
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
  }, [currVersionId, chapterId, setIsNotesOpen]);

  const verseNumbers = useMemo(() => {
    const nums = verses.map((v) => Number(v.number)).filter((n) => !Number.isNaN(n));
    nums.sort((a, b) => a - b);
    return nums;
  }, [verses]);

  const minVerse = verseNumbers[0] ?? null;
  const maxVerse = verseNumbers[verseNumbers.length - 1] ?? null;

  useEffect(() => {
    if (!hasChapter) return;

    if (!passageRange || passageRange.start == null || passageRange.end == null) {
      setActiveRange(null);
      return;
    }

    const s = Number(passageRange.start);
    const e = Number(passageRange.end);
    if (Number.isNaN(s) || Number.isNaN(e)) return;

    const start = Math.min(s, e);
    const end = Math.max(s, e);

    const boundedStart = minVerse != null ? Math.max(start, minVerse) : start;
    const boundedEnd = maxVerse != null ? Math.min(end, maxVerse) : end;

    setActiveRange({ start: boundedStart, end: boundedEnd });
  }, [passageRange, hasChapter, chapterId, currVersionId, minVerse, maxVerse]);

  const startOptions = useMemo(() => {
    if (!verseNumbers.length) return [];
    if (rangeAnchor == null) return verseNumbers;
    const idx = verseNumbers.findIndex((n) => n === rangeAnchor);
    return idx >= 0 ? verseNumbers.slice(idx) : verseNumbers;
  }, [verseNumbers, rangeAnchor]);

  const endOptions = useMemo(() => {
    if (!verseNumbers.length) return [];
    const start = rangeStart ?? rangeAnchor;
    if (start == null) return verseNumbers;
    const idx = verseNumbers.findIndex((n) => n === start);
    return idx >= 0 ? verseNumbers.slice(idx) : verseNumbers;
  }, [verseNumbers, rangeStart, rangeAnchor]);

  const visibleVerses = useMemo(() => {
    if (!activeRange) return verses;
    const { start, end } = activeRange;
    return verses.filter((v) => v.number >= start && v.number <= end);
  }, [verses, activeRange]);

  const pairedVerses = useMemo(() => {
    const out = [];
    for (let i = 0; i < visibleVerses.length; i += 2) {
      out.push([visibleVerses[i], visibleVerses[i + 1]]);
    }
    return out;
  }, [visibleVerses]);

  const showArrows = hasChapter && (canPrev || canNext);

  useEffect(() => {
    if (!hasChapter) {
      setIsNotesOpen?.(false);
      setNoteDraft("");
      setNoteTitleDraft("");
      return;
    }

    if (isNotesOpen) {
      const existing = getChapterNote?.(noteKey);

      const rangeLabel = activeRange ? ` (v${activeRange.start}–${activeRange.end})` : "";
      const fallbackTitle = `Notes — ${book?.name || ""} ${chapterNumber}${rangeLabel}`.trim();

      const existingTitle = typeof existing === "string" ? "" : existing?.title || "";
      const existingText = typeof existing === "string" ? existing : existing?.text || "";

      setNoteTitleDraft(existingTitle || fallbackTitle);
      setNoteDraft(existingText || "");
    }
  }, [isNotesOpen, hasChapter, noteKey, activeRange, chapterNumber, book?.name, setIsNotesOpen, getChapterNote]);

  useEffect(() => {
    if (!hasChapter) return;

    const onKeyDown = (e) => {
      const el = e.target;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (typing) return;

      if (rangeModalOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          setRangeModalOpen(false);
        }
        return;
      }

      if (isNotesOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          setIsNotesOpen?.(false);
        }
        return;
      }

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
  }, [hasChapter, canPrev, canNext, onPrev, onNext, isNotesOpen, setIsNotesOpen, rangeModalOpen]);

  const openRangeModalFromVerse = (verseNumber) => {
    if (!hasChapter) return;

    const n = Number(verseNumber);
    if (Number.isNaN(n)) return;

    setIsNotesOpen?.(false);

    setRangeAnchor(n);
    setRangeStart(n);
    setRangeEnd(n);
    setRangeModalOpen(true);
  };

  const applyRange = () => {
    if (rangeStart == null || rangeEnd == null) return;

    const s = Number(rangeStart);
    const e = Number(rangeEnd);
    if (Number.isNaN(s) || Number.isNaN(e)) return;

    const start = Math.min(s, e);
    const end = Math.max(s, e);

    const boundedStart = minVerse != null ? Math.max(start, minVerse) : start;
    const boundedEnd = maxVerse != null ? Math.min(end, maxVerse) : end;

    setActiveRange({ start: boundedStart, end: boundedEnd });

    setRangeModalOpen(false);

    if (requireAuthForNotes && !requireAuthForNotes()) return;
    setIsNotesOpen?.(true);
  };

  const clearRange = () => {
    setActiveRange(null);
  };

  const toggleNotes = () => {
    if (!hasChapter) return;

    if (!isNotesOpen) {
      if (requireAuthForNotes && !requireAuthForNotes()) return;
    }

    setIsNotesOpen?.((v) => !v);
  };

  const closeNotes = () => setIsNotesOpen?.(false);

  const submitNotes = async () => {
    if (!hasChapter) return;
    if (!user) return;

    try {
      await createNote({
        bibleId: currVersionId,
        chapterId,
        rangeStart: activeRange?.start ?? null,
        rangeEnd: activeRange?.end ?? null,
        title: noteTitleDraft,
        text: noteDraft,
      });

      closeNotes();
    } catch (e) {
      console.error("Failed to save note:", e);
    }
  };

  const normalizeText = (t) => (t ?? "").toString().replace(/\s+/g, " ").trim();

  return (
    <section className={`DisplaySection ${isNotesOpen ? "notesOpen" : ""}`}>
      <h2 className="bookChapterHeader">
        {hasChapter ? (
          <div className="chapterHeaderStack">
            <button
              type="button"
              className={`chapterTitle chapterTitleButton ${isNotesOpen ? "active" : ""}`}
              onClick={toggleNotes}
              aria-expanded={isNotesOpen ? "true" : "false"}
              title="Click to add/view notes"
            >
              {book?.name || ""} {chapterNumber}
              {activeRange ? ` (v${activeRange.start}–${activeRange.end})` : ""}
            </button>

            {activeRange && (
              <div className="clearRangeRow">
                <button
                  type="button"
                  className="clearRangeBtn"
                  onClick={clearRange}
                  title="Show full chapter"
                >
                  Clear range
                </button>
              </div>
            )}
          </div>
        ) : (
          <span className="chapterTitle placeholder">Select a book and chapter to begin.</span>
        )}
      </h2>

      {rangeModalOpen && (
        <div
          className="rangeModalOverlay"
          role="dialog"
          aria-modal="true"
          aria-label="Select verse range"
          onMouseDown={() => setRangeModalOpen(false)}
        >
          <div className="rangeModalCard" onMouseDown={(e) => e.stopPropagation()}>
            <div className="rangeModalHeader">
              <div className="rangeModalTitle">Select range (starting from v{rangeAnchor})</div>
              <button
                type="button"
                className="rangeModalClose"
                onClick={() => setRangeModalOpen(false)}
                aria-label="Close range selector"
              >
                ✕
              </button>
            </div>

            <div className="rangeModalBody">
              <div className="rangeRow">
                <label className="rangeLabel">Start</label>
                <select
                  className="rangeSelect"
                  value={rangeStart ?? ""}
                  onChange={(e) => {
                    const nextStart = Number(e.target.value);
                    setRangeStart(nextStart);

                    if (rangeEnd == null || Number(rangeEnd) < nextStart) {
                      setRangeEnd(nextStart);
                    }
                  }}
                >
                  {startOptions.map((n) => (
                    <option key={`s-${n}`} value={n}>
                      v{n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rangeRow">
                <label className="rangeLabel">End</label>
                <select
                  className="rangeSelect"
                  value={rangeEnd ?? ""}
                  onChange={(e) => setRangeEnd(Number(e.target.value))}
                >
                  {endOptions.map((n) => (
                    <option key={`e-${n}`} value={n}>
                      v{n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rangeHint">
                Must include at least one verse (defaults to the clicked verse).
              </div>
            </div>

            <div className="rangeModalFooter">
              <button
                type="button"
                className="rangeBtn rangeBtnGhost"
                onClick={() => {
                  setRangeStart(rangeAnchor);
                  setRangeEnd(rangeAnchor);
                }}
              >
                Just v{rangeAnchor}
              </button>

              <button type="button" className="rangeBtn rangeBtnPrimary" onClick={applyRange}>
                Apply range
              </button>
            </div>
          </div>
        </div>
      )}

      {hasChapter && isNotesOpen && (
        <section className="chapterNotesShell" aria-label="Chapter notes editor">
          <div className="chapterNotesInner">
            <div className="chapterNotesHeader">
              <input
                className="chapterNotesTitleInput"
                value={noteTitleDraft}
                onChange={(e) => setNoteTitleDraft(e.target.value)}
                placeholder={`Notes — ${book?.name || ""} ${chapterNumber}`}
                disabled={!user || initializing}
              />

              <div className="chapterNotesActions">
                <button type="button" className="notesBtn notesBtnGhost" onClick={closeNotes}>
                  Exit
                </button>
                <button
                  type="button"
                  className="notesBtn notesBtnPrimary"
                  onClick={submitNotes}
                  disabled={!user || initializing}
                  title={!user ? "Log in to save notes" : undefined}
                >
                  Submit
                </button>
              </div>
            </div>

            {!initializing && !user && (
              <div className="notesLoginPrompt" role="status">
                You must be logged in to write and save notes.
              </div>
            )}

            <textarea
              className="chapterNotesTextarea"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder={user ? "Write your notes here…" : "Log in to write notes…"}
              disabled={!user || initializing}
            />
          </div>
        </section>
      )}

      <div className="displayArea">
        {error && hasChapter && <div role="alert">Error: {error}</div>}

        {loading && hasChapter && !verses.length && <div>Loading verses…</div>}

        {hasChapter && !loading && !error && (
          <ol className="versesList">
            {pairedVerses.map(([v1, v2], idx) => (
              <li key={v1?.id || idx} className="verseRowPair">
                {v1 && (
                  <span
                    role="button"
                    tabIndex={0}
                    className="verseInlineBtn"
                    onClick={() => openRangeModalFromVerse(v1.number)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openRangeModalFromVerse(v1.number);
                      }
                    }}
                    title="Click to select verse range"
                  >
                    <sup className="verseNum">{v1.number}</sup>
                    <span className="verseText">{normalizeText(verseTexts[v1.id])}</span>
                  </span>
                )}

                {v2 && (
                  <span
                    role="button"
                    tabIndex={0}
                    className="verseInlineBtn"
                    onClick={() => openRangeModalFromVerse(v2.number)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openRangeModalFromVerse(v2.number);
                      }
                    }}
                    title="Click to select verse range"
                  >
                    <span className="verseGap"> </span>
                    <sup className="verseNum">{v2.number}</sup>
                    <span className="verseText">{normalizeText(verseTexts[v2.id])}</span>
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}

        {showArrows && (
          <section className="chapterNav">
            {canPrev && (
              <button
                className="navArrow navArrowLeft"
                onClick={onPrev}
                aria-label="Previous chapter"
                disabled={isNotesOpen || rangeModalOpen}
              >
                ←
              </button>
            )}
            {canNext && (
              <button
                className="navArrow navArrowRight"
                onClick={onNext}
                aria-label="Next chapter"
                disabled={isNotesOpen || rangeModalOpen}
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
