import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import SectionCard from "../components/SectionCard";
import {
  formatNoteRangeLabel,
  formatReadableNoteReference,
} from "../utils/noteFormatting";

const buildNoteKey = (note) =>
  note?._id ||
  note?.id ||
  `${note?.chapterId || "note"}-${note?.updatedAt || note?.createdAt || note?.title || "item"}`;

const NotesListScreen = ({ notes, loading, error, onRefresh, navigation }) => {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState("updated");
  const [scope, setScope] = React.useState("all");

  const filteredNotes = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    let nextNotes = [...notes];

    if (scope === "range") {
      nextNotes = nextNotes.filter((note) => note?.rangeStart != null && note?.rangeEnd != null);
    } else if (scope === "chapter") {
      nextNotes = nextNotes.filter((note) => note?.rangeStart == null || note?.rangeEnd == null);
    }

    if (search) {
      nextNotes = nextNotes.filter((note) => {
        const haystack = [
          note?.title,
          note?.text,
          note?.preview,
          formatReadableNoteReference(note),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(search);
      });
    }

    if (sort === "title") {
      nextNotes.sort((a, b) => String(a?.title || "").localeCompare(String(b?.title || "")));
    } else if (sort === "oldest") {
      nextNotes.sort(
        (a, b) =>
          new Date(a?.updatedAt || a?.createdAt || 0).getTime() -
          new Date(b?.updatedAt || b?.createdAt || 0).getTime()
      );
    } else {
      nextNotes.sort(
        (a, b) =>
          new Date(b?.updatedAt || b?.createdAt || 0).getTime() -
          new Date(a?.updatedAt || a?.createdAt || 0).getTime()
      );
    }

    return nextNotes;
  }, [notes, query, scope, sort]);

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
        <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
          Notes
        </Text>
        <Text className="font-display text-[32px] leading-[38px] text-ink">
          Keep your reflections close to the text.
        </Text>
      </View>

      <SectionCard>
        <View className="mb-2 flex-row items-center justify-between gap-3">
          <Text className="font-display text-[24px] leading-[30px] text-ink">Recent notes</Text>
          <Pressable
            onPress={onRefresh}
            disabled={loading}
            className={`rounded-full bg-sand px-4 py-2 ${loading ? "opacity-65" : ""}`}
          >
            <Text className="text-[13px] font-bold text-ink">
              {loading ? "Refreshing..." : "Refresh"}
            </Text>
          </Pressable>
        </View>

        <Text className="font-body text-[14px] leading-6 text-taupe">
          Latest saved notes pulled through the shared Notes API layer.
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search notes, references, or verses"
          className="rounded-2xl border border-lineStrong bg-white px-4 py-3 text-[15px] text-ink"
          placeholderTextColor="#8a7868"
        />

        <View className="flex-row flex-wrap gap-2">
          {[
            { id: "updated", label: "Most recent" },
            { id: "oldest", label: "Oldest" },
            { id: "title", label: "Title A-Z" },
          ].map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setSort(option.id)}
              className={`rounded-full px-4 py-2 ${
                sort === option.id ? "bg-ink" : "bg-sand"
              }`}
            >
              <Text className={`text-[12px] font-bold ${sort === option.id ? "text-cream" : "text-ink"}`}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row flex-wrap gap-2">
          {[
            { id: "all", label: "All notes" },
            { id: "range", label: "Verse ranges" },
            { id: "chapter", label: "Full chapters" },
          ].map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setScope(option.id)}
              className={`rounded-full px-4 py-2 ${
                scope === option.id ? "bg-ink" : "bg-sand"
              }`}
            >
              <Text className={`text-[12px] font-bold ${scope === option.id ? "text-cream" : "text-ink"}`}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {!!error && <Text className="font-body text-[14px] leading-5 text-danger">{error}</Text>}

        {loading ? (
          <View className="flex-row items-center gap-3">
            <ActivityIndicator color="#8f6840" />
            <Text className="font-body text-[15px] leading-6 text-walnut">Loading notes...</Text>
          </View>
        ) : filteredNotes.length === 0 ? (
          <Text className="font-body text-[15px] leading-6 text-walnut">No notes found yet.</Text>
        ) : (
          <View className="gap-3">
            {filteredNotes.map((note) => (
              <Pressable
                className="rounded-[20px] border border-line bg-white/70 px-4 py-4"
                key={buildNoteKey(note)}
                onPress={() =>
                  navigation.navigate("NoteDetail", {
                    noteId: note?._id || note?.id,
                    note,
                  })
                }
              >
                <Text className="mb-1 text-[16px] font-semibold text-ink">
                  {note?.title || "Untitled"}
                </Text>
                <Text className="mb-2 text-[12px] font-semibold uppercase tracking-[1px] text-amber">
                  {formatReadableNoteReference(note) || "No reference yet"}
                </Text>
                <Text className="font-body text-[14px] leading-5 text-walnut" numberOfLines={3}>
                  {note?.preview || note?.text || "No note preview available."}
                </Text>
                <Text className="mt-3 font-body text-[12px] leading-5 text-taupe">
                  {formatNoteRangeLabel(note)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </SectionCard>
    </ScrollView>
  );
};

export default NotesListScreen;
