import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import SectionCard from "../components/SectionCard";
import VerseBlock from "../components/VerseBlock";
import SelectionSheet from "../components/SelectionSheet";
import NoteComposerSheet from "../components/NoteComposerSheet";
import { formatReadableNoteReference } from "../utils/noteFormatting";

const getBookIdFromChapterId = (chapterId) => {
  if (!chapterId) return "";
  return String(chapterId).split(".")[0] || "";
};

const normalizeSelection = (start, end) => {
  if (start == null || end == null) return null;
  return {
    start: Math.min(start, end),
    end: Math.max(start, end),
  };
};

const formatSelectionLabel = (selection) => {
  if (!selection) return "";
  if (selection.start === selection.end) return `v${selection.start}`;
  return `v${selection.start}-${selection.end}`;
};

const buildReferenceLabel = ({ bookName, chapterNumber, selection }) => {
  const base = [bookName, chapterNumber].filter(Boolean).join(" ").trim();
  if (!base) return "Selected passage";
  if (!selection) return base;
  return `${base} ${formatSelectionLabel(selection)}`;
};

const PassageReaderScreen = ({ route, navigation, bibleApi, notesApi, onRefreshNotes }) => {
  const reading = route?.params?.reading || {};
  const initialVersionId = reading?.versionId || "06125adad2d5898a-01";
  const initialChapterId = reading?.chapterId || "";
  const initialBookId = getBookIdFromChapterId(initialChapterId);
  const initialSelection = normalizeSelection(reading?.rangeStart, reading?.rangeEnd);
  const initialIdsRef = React.useRef({
    bookId: initialBookId,
    chapterId: initialChapterId,
  });
  const initialSelectionRef = React.useRef(initialSelection);
  const appliedInitialSelectionRef = React.useRef(false);
  const currentBookIdRef = React.useRef(initialBookId);
  const currentChapterIdRef = React.useRef(initialChapterId);

  const [versions, setVersions] = React.useState([]);
  const [books, setBooks] = React.useState([]);
  const [chapters, setChapters] = React.useState([]);
  const [verses, setVerses] = React.useState([]);

  const [versionId, setVersionId] = React.useState(initialVersionId);
  const [bookId, setBookId] = React.useState(initialBookId);
  const [chapterId, setChapterId] = React.useState(initialChapterId);

  const [loadingMeta, setLoadingMeta] = React.useState(true);
  const [loadingVerses, setLoadingVerses] = React.useState(false);
  const [savingNote, setSavingNote] = React.useState(false);
  const [error, setError] = React.useState("");
  const [noteError, setNoteError] = React.useState("");

  const [versionQuery, setVersionQuery] = React.useState("");
  const [bookQuery, setBookQuery] = React.useState("");
  const [chapterQuery, setChapterQuery] = React.useState("");
  const [versionSheetOpen, setVersionSheetOpen] = React.useState(false);
  const [bookSheetOpen, setBookSheetOpen] = React.useState(false);
  const [chapterSheetOpen, setChapterSheetOpen] = React.useState(false);
  const [noteSheetOpen, setNoteSheetOpen] = React.useState(false);

  const [selectionAnchor, setSelectionAnchor] = React.useState(null);
  const [selection, setSelection] = React.useState(null);
  const [noteTitle, setNoteTitle] = React.useState("");
  const [noteBody, setNoteBody] = React.useState("");
  const [existingNote, setExistingNote] = React.useState(null);
  const [loadingExistingNote, setLoadingExistingNote] = React.useState(false);
  const [showRestoredSelectionBanner, setShowRestoredSelectionBanner] = React.useState(false);

  React.useEffect(() => {
    currentBookIdRef.current = bookId;
  }, [bookId]);

  React.useEffect(() => {
    currentChapterIdRef.current = chapterId;
  }, [chapterId]);

  React.useEffect(() => {
    initialIdsRef.current = {
      bookId: getBookIdFromChapterId(reading?.chapterId || ""),
      chapterId: reading?.chapterId || "",
    };
    initialSelectionRef.current = normalizeSelection(reading?.rangeStart, reading?.rangeEnd);
    appliedInitialSelectionRef.current = false;
    setSelectionAnchor(null);
    setSelection(null);
    setNoteSheetOpen(false);
    setNoteError("");
    setExistingNote(null);
    setLoadingExistingNote(false);
    setShowRestoredSelectionBanner(false);

    if (reading?.versionId) {
      setVersionId(reading.versionId);
    }
    if (reading?.chapterId) {
      setBookId(getBookIdFromChapterId(reading.chapterId));
      setChapterId(reading.chapterId);
    }
  }, [reading?.chapterId, reading?.rangeEnd, reading?.rangeStart, reading?.versionId]);

  React.useEffect(() => {
    let active = true;

    (async () => {
      setLoadingMeta(true);
      setError("");

      try {
        const nextVersions = await bibleApi.listVersions();
        if (!active) return;

        const safeVersions = Array.isArray(nextVersions) ? nextVersions : [];
        setVersions(safeVersions);

        const preferredVersion =
          safeVersions.find((item) => item.id === initialVersionId)?.id ||
          safeVersions[0]?.id ||
          initialVersionId;

        setVersionId(preferredVersion);
      } catch (err) {
        if (active) {
          setVersions([]);
          setError(err?.message || "Unable to load Bible versions.");
        }
      } finally {
        if (active) setLoadingMeta(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [bibleApi, initialVersionId]);

  React.useEffect(() => {
    let active = true;

    if (!versionId) {
      setBooks([]);
      setBookId("");
      return () => {
        active = false;
      };
    }

    (async () => {
      setLoadingMeta(true);
      setError("");

      try {
        const nextBooks = await bibleApi.listBooks(versionId);
        if (!active) return;

        const safeBooks = Array.isArray(nextBooks) ? nextBooks : [];
        setBooks(safeBooks);

        const preferredBookId =
          safeBooks.find((item) => item.id === initialIdsRef.current.bookId)?.id ||
          safeBooks.find((item) => item.id === currentBookIdRef.current)?.id ||
          safeBooks[0]?.id ||
          "";

        setBookId(preferredBookId);
      } catch (err) {
        if (active) {
          setBooks([]);
          setBookId("");
          setError(err?.message || "Unable to load books.");
        }
      } finally {
        if (active) setLoadingMeta(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [bibleApi, versionId]);

  React.useEffect(() => {
    let active = true;

    if (!versionId || !bookId) {
      setChapters([]);
      setChapterId("");
      return () => {
        active = false;
      };
    }

    (async () => {
      setLoadingMeta(true);
      setError("");

      try {
        const nextChapters = await bibleApi.listChapters(versionId, bookId);
        if (!active) return;

        const safeChapters = Array.isArray(nextChapters) ? nextChapters : [];
        setChapters(safeChapters);

        const preferredChapterId =
          safeChapters.find((item) => item.id === initialIdsRef.current.chapterId)?.id ||
          safeChapters.find((item) => item.id === currentChapterIdRef.current)?.id ||
          safeChapters[0]?.id ||
          "";

        setChapterId(preferredChapterId);
      } catch (err) {
        if (active) {
          setChapters([]);
          setChapterId("");
          setError(err?.message || "Unable to load chapters.");
        }
      } finally {
        if (active) setLoadingMeta(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [bibleApi, versionId, bookId]);

  React.useEffect(() => {
    let active = true;

    if (!versionId || !chapterId) {
      setVerses([]);
      return () => {
        active = false;
      };
    }

    (async () => {
      setLoadingVerses(true);
      setError("");

      try {
        const nextVerses = await bibleApi.getChapterVerses({ versionId, chapterId });
        if (!active) return;
        setVerses(Array.isArray(nextVerses) ? nextVerses : []);
      } catch (err) {
        if (active) {
          setVerses([]);
          setError(err?.message || "Unable to load passage.");
        }
      } finally {
        if (active) setLoadingVerses(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [bibleApi, versionId, chapterId]);

  React.useEffect(() => {
    setSelectionAnchor(null);
    setSelection(null);
    setNoteSheetOpen(false);
    setNoteError("");
    setExistingNote(null);
    setLoadingExistingNote(false);
    appliedInitialSelectionRef.current = false;
    setShowRestoredSelectionBanner(false);
  }, [versionId, chapterId]);

  React.useEffect(() => {
    if (!verses.length || appliedInitialSelectionRef.current) {
      return;
    }

    const nextSelection = initialSelectionRef.current;
    if (!nextSelection || !reading?.chapterId || chapterId !== reading.chapterId) {
      return;
    }

    const verseNumbers = verses
      .map((verse) => Number(verse?.number))
      .filter((value) => !Number.isNaN(value));

    if (!verseNumbers.length) {
      return;
    }

    const boundedSelection = {
      start: Math.max(nextSelection.start, Math.min(...verseNumbers)),
      end: Math.min(nextSelection.end, Math.max(...verseNumbers)),
    };

    setSelectionAnchor(boundedSelection.start);
    setSelection(boundedSelection);
    appliedInitialSelectionRef.current = true;
    setShowRestoredSelectionBanner(true);
  }, [chapterId, reading?.chapterId, reading?.rangeEnd, reading?.rangeStart, verses]);

  const selectedVersion = React.useMemo(
    () => versions.find((item) => item.id === versionId) || null,
    [versions, versionId]
  );
  const selectedBook = React.useMemo(
    () => books.find((item) => item.id === bookId) || null,
    [books, bookId]
  );
  const selectedChapter = React.useMemo(
    () => chapters.find((item) => item.id === chapterId) || null,
    [chapters, chapterId]
  );

  const selectedChapterNumber =
    selectedChapter?.number || String(chapterId || "").split(".")[1] || "";
  const selectedReference = buildReferenceLabel({
    bookName: selectedBook?.name,
    chapterNumber: selectedChapterNumber,
    selection,
  });

  React.useEffect(() => {
    let active = true;

    if (
      !selection ||
      !notesApi ||
      !chapterId ||
      !versionId ||
      selection.start == null ||
      selection.end == null
    ) {
      setExistingNote(null);
      setLoadingExistingNote(false);
      return () => {
        active = false;
      };
    }

    (async () => {
      setLoadingExistingNote(true);

      try {
        const response = await notesApi.getScopedNote({
          bibleId: versionId,
          chapterId,
          rangeStart: selection.start,
          rangeEnd: selection.end,
        });

        if (!active) return;
        setExistingNote(response?.note || null);
      } catch {
        if (active) {
          setExistingNote(null);
        }
      } finally {
        if (active) setLoadingExistingNote(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [chapterId, notesApi, selection, versionId]);

  React.useEffect(() => {
    navigation.setOptions({
      title: selectedReference || reading?.reference || "Reading",
    });
  }, [navigation, reading?.reference, selectedReference]);

  const filteredVersions = React.useMemo(() => {
    const query = versionQuery.trim().toLowerCase();
    if (!query) return versions;

    return versions.filter((item) => {
      const label = `${item?.abbreviation || ""} ${item?.name || ""}`.toLowerCase();
      return label.includes(query);
    });
  }, [versionQuery, versions]);

  const filteredBooks = React.useMemo(() => {
    const query = bookQuery.trim().toLowerCase();
    if (!query) return books;

    return books.filter((item) => (item?.name || "").toLowerCase().includes(query));
  }, [bookQuery, books]);

  const filteredChapters = React.useMemo(() => {
    const query = chapterQuery.trim().toLowerCase();
    if (!query) return chapters;

    return chapters.filter((item) => {
      const value = `${item?.number || ""}`.toLowerCase();
      return value.includes(query) || `chapter ${value}`.includes(query);
    });
  }, [chapterQuery, chapters]);

  const chapterIndex = React.useMemo(
    () => chapters.findIndex((item) => item.id === chapterId),
    [chapters, chapterId]
  );

  const canGoPrevious = chapterIndex > 0;
  const canGoNext = chapterIndex >= 0 && chapterIndex < chapters.length - 1;

  const handleVersePress = (verseNumber) => {
    const numericVerse = Number(verseNumber);
    if (Number.isNaN(numericVerse)) return;
    setShowRestoredSelectionBanner(false);

    if (selectionAnchor == null) {
      setSelectionAnchor(numericVerse);
      setSelection({ start: numericVerse, end: numericVerse });
      return;
    }

    const nextSelection = normalizeSelection(selectionAnchor, numericVerse);
    setSelection(nextSelection);
  };

  const clearSelection = () => {
    setSelectionAnchor(null);
    setSelection(null);
    setNoteSheetOpen(false);
    setNoteError("");
    setShowRestoredSelectionBanner(false);
  };

  const openNoteComposer = () => {
    if (!selection) return;

    const nextTitle =
      existingNote?.title ||
      `${selectedBook?.name || "Passage"} ${selectedChapterNumber} ${formatSelectionLabel(
        selection
      )}`.trim();

    setNoteTitle(nextTitle);
    setNoteBody(existingNote?.text || "");
    setNoteError("");
    setNoteSheetOpen(true);
  };

  const handleSaveNote = async () => {
    if (!selection || !notesApi || !chapterId) return;

    setSavingNote(true);
    setNoteError("");

    try {
      if (existingNote?._id || existingNote?.id) {
        await notesApi.updateNote(existingNote._id || existingNote.id, {
          title: noteTitle.trim(),
          text: noteBody.trim(),
        });
      } else {
        await notesApi.createNote({
          bibleId: versionId,
          chapterId,
          rangeStart: selection.start,
          rangeEnd: selection.end,
          title: noteTitle.trim(),
          text: noteBody.trim(),
        });
      }

      setNoteSheetOpen(false);
      clearSelection();
      if (typeof onRefreshNotes === "function") {
        await onRefreshNotes();
      }
    } catch (err) {
      setNoteError(err?.message || "Unable to save note.");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-parchment"
        contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 140 }}
      >
        <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
          <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
            Read
          </Text>
          <Text className="mb-3 font-display text-[32px] leading-[38px] text-ink">
            {reading?.title || "Settle into the text."}
          </Text>
          <Text className="font-body text-[15px] leading-6 text-walnut">
            {reading?.summary ||
              "Choose a version, open a book, and move chapter by chapter with reflection close at hand."}
          </Text>
        </View>

        <SectionCard>
          <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
            Reader controls
          </Text>

          <View className="flex-row flex-wrap gap-3">
            <Pressable
              onPress={() => setVersionSheetOpen(true)}
              className="min-w-[96px] rounded-full border border-lineStrong bg-white px-4 py-3"
            >
              <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                Version
              </Text>
              <Text className="mt-1 text-[15px] font-semibold text-ink">
                {selectedVersion?.abbreviation || "Choose"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setBookSheetOpen(true)}
              className="min-w-[120px] flex-1 rounded-full border border-lineStrong bg-white px-4 py-3"
            >
              <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                Book
              </Text>
              <Text className="mt-1 text-[15px] font-semibold text-ink">
                {selectedBook?.name || "Choose"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setChapterSheetOpen(true)}
              className="min-w-[96px] rounded-full border border-lineStrong bg-white px-4 py-3"
            >
              <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                Chapter
              </Text>
              <Text className="mt-1 text-[15px] font-semibold text-ink">
                {selectedChapterNumber || "Choose"}
              </Text>
            </Pressable>
          </View>

          <View className="mt-1 flex-row items-center justify-between gap-3 rounded-[22px] bg-sand px-4 py-4">
            <View className="flex-1">
              <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                Current passage
              </Text>
              <Text className="mt-1 font-display text-[22px] leading-[28px] text-ink">
                {selectedReference || "Loading passage"}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => canGoPrevious && setChapterId(chapters[chapterIndex - 1]?.id || "")}
                disabled={!canGoPrevious}
                className={`rounded-full px-4 py-3 ${
                  canGoPrevious ? "bg-ink" : "bg-line"
                }`}
              >
                <Text className="text-[13px] font-bold text-cream">Prev</Text>
              </Pressable>
              <Pressable
                onPress={() => canGoNext && setChapterId(chapters[chapterIndex + 1]?.id || "")}
                disabled={!canGoNext}
                className={`rounded-full px-4 py-3 ${canGoNext ? "bg-ink" : "bg-line"}`}
              >
                <Text className="text-[13px] font-bold text-cream">Next</Text>
              </Pressable>
            </View>
          </View>
        </SectionCard>

        {!!reading?.reflectionPrompt && (
          <SectionCard tone="soft">
            <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
              Reflection prompt
            </Text>
            <Text className="font-body text-[15px] leading-6 text-walnut">
              {reading.reflectionPrompt}
            </Text>
          </SectionCard>
        )}

        <SectionCard>
          <View className="mb-2 flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="font-display text-[24px] leading-[30px] text-ink">Scripture</Text>
              <Text className="font-body text-[14px] leading-6 text-taupe">
                Tap a verse once to start a selection, then tap again to expand the range.
              </Text>
            </View>
            {(loadingMeta || loadingVerses) && <ActivityIndicator color="#8f6840" />}
          </View>

          {showRestoredSelectionBanner && !!selection && chapterId === reading?.chapterId && (
            <View className="mb-3 rounded-[20px] border border-line bg-sand px-4 py-3">
              <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                Saved note range
              </Text>
              <Text className="mt-1 font-body text-[14px] leading-6 text-walnut">
                This saved selection reopened with the note so you can pick up the same passage context.
              </Text>
            </View>
          )}

          {!!error && (
            <Text className="mb-2 font-body text-[14px] leading-5 text-danger">{error}</Text>
          )}

          {loadingVerses ? (
            <View className="flex-row items-center gap-3">
              <ActivityIndicator color="#8f6840" />
              <Text className="font-body text-[15px] leading-6 text-walnut">
                Loading chapter...
              </Text>
            </View>
          ) : verses.length ? (
            <View className="gap-3">
              {verses.map((verse) => {
                const isSelected =
                  selection &&
                  verse.number >= selection.start &&
                  verse.number <= selection.end;
                const showSavedBadge =
                  existingNote &&
                  verse.number >= (existingNote?.rangeStart ?? Number.MIN_SAFE_INTEGER) &&
                  verse.number <= (existingNote?.rangeEnd ?? Number.MAX_SAFE_INTEGER) &&
                  selection &&
                  existingNote?.chapterId === chapterId;

                return (
                  <Pressable key={`${chapterId}-${verse.number}`} onPress={() => handleVersePress(verse.number)}>
                    <VerseBlock
                      number={verse.number}
                      text={verse.text}
                      selected={!!isSelected}
                      badgeLabel={showSavedBadge ? "Saved note" : ""}
                    />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text className="font-body text-[15px] leading-6 text-walnut">
              Select a book and chapter to start reading.
            </Text>
          )}
        </SectionCard>
      </ScrollView>

      {selection ? (
        <View className="absolute bottom-6 left-5 right-5 rounded-[28px] border border-lineStrong bg-cream px-5 py-4 shadow-soft">
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
                Selected text
              </Text>
              <Text className="mt-1 font-display text-[22px] leading-[28px] text-ink">
                {buildReferenceLabel({
                  bookName: selectedBook?.name,
                  chapterNumber: selectedChapterNumber,
                  selection,
                })}
              </Text>
              <Text className="mt-1 font-body text-[13px] leading-5 text-taupe">
                {loadingExistingNote
                  ? "Checking for an existing note..."
                  : existingNote
                    ? `Existing note found: ${existingNote.title || formatReadableNoteReference(existingNote)}`
                    : "No saved note for this exact range yet."}
              </Text>
            </View>
            <Pressable onPress={clearSelection} className="rounded-full bg-sand px-4 py-3">
              <Text className="text-[13px] font-bold text-ink">Clear</Text>
            </Pressable>
          </View>
          <Pressable onPress={openNoteComposer} className="mt-4 rounded-full bg-ink px-5 py-4">
            <Text className="text-center text-[15px] font-bold text-cream">
              {existingNote ? "Edit note" : "Add note"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <SelectionSheet
        visible={versionSheetOpen}
        title="Choose a version"
        subtitle="Keep the version switch close, but let reading stay central."
        searchValue={versionQuery}
        onChangeSearch={setVersionQuery}
        searchPlaceholder="Search version"
        items={filteredVersions}
        selectedValue={versionId}
        onClose={() => setVersionSheetOpen(false)}
        onSelect={(item) => {
          setVersionId(item.id);
          setVersionSheetOpen(false);
          setBookQuery("");
          setChapterQuery("");
        }}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => `${item.abbreviation || item.id} - ${item.name}`}
        detailExtractor={(item) => item.language || ""}
        emptyMessage="No Bible versions matched that search."
      />

      <SelectionSheet
        visible={bookSheetOpen}
        title="Choose a book"
        subtitle={selectedVersion ? `${selectedVersion.name}` : ""}
        searchValue={bookQuery}
        onChangeSearch={setBookQuery}
        searchPlaceholder="Search book"
        items={filteredBooks}
        selectedValue={bookId}
        onClose={() => setBookSheetOpen(false)}
        onSelect={(item) => {
          setBookId(item.id);
          setBookSheetOpen(false);
          setChapterQuery("");
        }}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item.name}
        emptyMessage="No books matched that search."
      />

      <SelectionSheet
        visible={chapterSheetOpen}
        title="Choose a chapter"
        subtitle={selectedBook?.name || ""}
        searchValue={chapterQuery}
        onChangeSearch={setChapterQuery}
        searchPlaceholder="Search chapter number"
        items={filteredChapters}
        selectedValue={chapterId}
        onClose={() => setChapterSheetOpen(false)}
        onSelect={(item) => {
          setChapterId(item.id);
          setChapterSheetOpen(false);
        }}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => `Chapter ${item.number}`}
        emptyMessage="No chapters matched that search."
      />

      <NoteComposerSheet
        visible={noteSheetOpen}
        title={noteTitle}
        reference={selectedReference}
        body={noteBody}
        onChangeTitle={setNoteTitle}
        onChangeBody={setNoteBody}
        onClose={() => setNoteSheetOpen(false)}
        onSubmit={handleSaveNote}
        submitting={savingNote}
        error={noteError}
      />
    </>
  );
};

export default PassageReaderScreen;
