import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import SectionCard from "../components/SectionCard";

const formatRangeLabel = (note) => {
  if (!note) return "";
  if (note?.rangeStart == null || note?.rangeEnd == null) return "Full chapter";
  if (note.rangeStart === note.rangeEnd) return `Verse ${note.rangeStart}`;
  return `Verses ${note.rangeStart}-${note.rangeEnd}`;
};

const formatReference = (note) => {
  const chapterId = String(note?.chapterId || "");
  const [bookId, chapterNum] = chapterId.split(".");
  const base = [bookId?.toUpperCase(), chapterNum].filter(Boolean).join(" ");
  const rangeLabel = formatRangeLabel(note);
  return [base, rangeLabel].filter(Boolean).join(" • ");
};

const resolveNoteId = (note) => note?._id || note?.id || "";

const NoteDetailScreen = ({ route, navigation, notesApi, onRefreshNotes }) => {
  const initialNote = route?.params?.note || null;
  const noteId = route?.params?.noteId || resolveNoteId(initialNote);

  const [note, setNote] = React.useState(initialNote);
  const [title, setTitle] = React.useState(initialNote?.title || "");
  const [text, setText] = React.useState(initialNote?.text || "");
  const [loading, setLoading] = React.useState(!initialNote);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    if (!noteId) {
      setError("Note not found.");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    if (initialNote) {
      return () => {
        active = false;
      };
    }

    (async () => {
      setLoading(true);
      setError("");

      try {
        const response = await notesApi.getNote(noteId);
        if (!active) return;
        const nextNote = response?.note || null;
        setNote(nextNote);
        setTitle(nextNote?.title || "");
        setText(nextNote?.text || "");
      } catch (err) {
        if (active) {
          setError(err?.message || "Unable to load note.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [initialNote, noteId, notesApi]);

  React.useEffect(() => {
    navigation.setOptions({
      title: note?.title || "Note",
    });
  }, [navigation, note?.title]);

  const handleSave = async () => {
    if (!noteId) return;

    setSaving(true);
    setError("");

    try {
      const response = await notesApi.updateNote(noteId, {
        title: title.trim(),
        text: text.trim(),
      });

      const updatedNote = response?.note || {
        ...(note || {}),
        title: title.trim(),
        text: text.trim(),
      };

      setNote(updatedNote);
      setTitle(updatedNote?.title || "");
      setText(updatedNote?.text || "");
      setDirty(false);

      if (typeof onRefreshNotes === "function") {
        await onRefreshNotes();
      }
    } catch (err) {
      setError(err?.message || "Unable to save note.");
    } finally {
      setSaving(false);
    }
  };

  const runDelete = async () => {
    if (!noteId) return;

    setSaving(true);
    setError("");

    try {
      await notesApi.deleteNote(noteId);
      if (typeof onRefreshNotes === "function") {
        await onRefreshNotes();
      }
      navigation.goBack();
    } catch (err) {
      setError(err?.message || "Unable to delete note.");
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete note?", "This cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: runDelete,
      },
    ]);
  };

  const handleOpenPassage = () => {
    if (!note?.chapterId) return;

    navigation.getParent()?.navigate("Read", {
      screen: "PassageReader",
      params: {
        reading: {
          versionId: note?.bibleId || "06125adad2d5898a-01",
          chapterId: note.chapterId,
          rangeStart: note?.rangeStart ?? null,
          rangeEnd: note?.rangeEnd ?? null,
          title: note?.title || "Saved note passage",
          reference: formatReference(note),
          summary: "Re-opened from your notes so you can keep reading and reflecting in context.",
        },
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
        <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
          Note detail
        </Text>
        <Text className="font-display text-[30px] leading-[36px] text-ink">
          {note?.title || "Saved reflection"}
        </Text>
        <Text className="mt-3 font-body text-[14px] leading-6 text-walnut">
          {formatReference(note) || "Reference unavailable"}
        </Text>
      </View>

      <SectionCard>
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-display text-[22px] leading-[28px] text-ink">Passage</Text>
          <Pressable
            onPress={handleOpenPassage}
            disabled={!note?.chapterId}
            className={`rounded-full px-4 py-2 ${note?.chapterId ? "bg-ink" : "bg-line"}`}
          >
            <Text className="text-[13px] font-bold text-cream">Open passage</Text>
          </Pressable>
        </View>
        <Text className="font-body text-[14px] leading-6 text-taupe">
          Jump back into the chapter and continue from the exact study context where this note began.
        </Text>
      </SectionCard>

      <SectionCard>
        {loading ? (
          <View className="flex-row items-center gap-3">
            <ActivityIndicator color="#8f6840" />
            <Text className="font-body text-[15px] leading-6 text-walnut">Loading note...</Text>
          </View>
        ) : (
          <View className="gap-4">
            <View>
              <Text className="mb-2 text-[12px] font-bold uppercase tracking-[1px] text-amber">
                Title
              </Text>
              <TextInput
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  setDirty(true);
                }}
                placeholder="Note title"
                className="rounded-2xl border border-lineStrong bg-white px-4 py-3 text-[15px] text-ink"
                placeholderTextColor="#8a7868"
              />
            </View>

            <View>
              <Text className="mb-2 text-[12px] font-bold uppercase tracking-[1px] text-amber">
                Reflection
              </Text>
              <TextInput
                value={text}
                onChangeText={(value) => {
                  setText(value);
                  setDirty(true);
                }}
                placeholder="Write your note"
                multiline
                textAlignVertical="top"
                className="min-h-[220px] rounded-[24px] border border-lineStrong bg-white px-4 py-4 text-[15px] leading-6 text-ink"
                placeholderTextColor="#8a7868"
              />
            </View>

            {!!error && (
              <Text className="font-body text-[14px] leading-5 text-danger">{error}</Text>
            )}

            <View className="flex-row items-center justify-between gap-3">
              <Pressable
                onPress={handleDelete}
                disabled={saving || !noteId}
                className={`rounded-full px-5 py-3 ${saving ? "bg-line" : "bg-[#a12626]"}`}
              >
                <Text className="text-[14px] font-bold text-cream">Delete</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                disabled={saving || !dirty}
                className={`rounded-full px-5 py-3 ${
                  saving || !dirty ? "bg-line" : "bg-ink"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  {saving ? <ActivityIndicator size="small" color="#fffaf3" /> : null}
                  <Text className="text-[14px] font-bold text-cream">
                    {saving ? "Working..." : "Save"}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}
      </SectionCard>
    </ScrollView>
  );
};

export default NoteDetailScreen;
