import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import SectionCard from "../components/SectionCard";
import { featuredReading, guidedCollections } from "../data/readingExperience";
import {
  formatReadableNoteReference,
  formatNoteRangeLabel,
} from "../utils/noteFormatting";

const HomeScreen = ({ user, notes, onRefresh, loading, navigation, defaultVersionId }) => {
  const recentHighlights = notes.slice(0, 3);

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
        <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
          {featuredReading.eyebrow}
        </Text>
        <Text className="mb-3 font-display text-[34px] leading-[40px] text-ink">
          {featuredReading.title}
        </Text>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          {featuredReading.summary}
        </Text>
        <View className="mt-5 flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
              {featuredReading.reference}
            </Text>
            <Text className="font-body text-[14px] leading-5 text-taupe">
              {featuredReading.duration}
            </Text>
          </View>
          <Pressable
            onPress={() =>
              navigation.navigate("PassageReader", {
                reading: {
                  ...featuredReading,
                  versionId: featuredReading.versionId || defaultVersionId,
                },
              })
            }
            className="rounded-full bg-ink px-5 py-3"
          >
            <Text className="text-[14px] font-bold text-cream">Open reading</Text>
          </Pressable>
        </View>
      </View>

      <SectionCard>
        <View className="mb-2 flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
              Study scripture
            </Text>
            <Text className="font-display text-[24px] leading-[30px] text-ink">
              Open the full reader
            </Text>
          </View>
          <Pressable
            onPress={() =>
              navigation.navigate("PassageReader", {
                reading: {
                  versionId: defaultVersionId,
                },
              })
            }
            className="rounded-full bg-ink px-5 py-3"
          >
            <Text className="text-[14px] font-bold text-cream">Browse</Text>
          </Pressable>
        </View>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          Move through versions, books, and chapters with a reading-first flow shaped for mobile.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text className="text-[12px] font-bold uppercase tracking-[2px] text-amber">
          Welcome back
        </Text>
        <Text className="font-display text-[28px] leading-[34px] text-ink">
          {user?.firstName || user?.username || "Friend"}, here is your next step.
        </Text>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          This layout takes a cue from Bible app patterns that keep the first screen centered on
          reading momentum, not settings.
        </Text>
      </SectionCard>

      {guidedCollections.map((item) => (
        <SectionCard key={item.title} tone="soft">
          <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
            Guided space
          </Text>
          <Text className="font-display text-[24px] leading-[30px] text-ink">{item.title}</Text>
          <Text className="font-body text-[15px] leading-6 text-walnut">{item.body}</Text>
        </SectionCard>
      ))}

      <SectionCard tone="soft">
        <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
          Reflection prompt
        </Text>
        <Text className="font-display text-[24px] leading-[30px] text-ink">
          Carry one question into the text.
        </Text>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          {featuredReading.reflectionPrompt}
        </Text>
      </SectionCard>

      <SectionCard>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-display text-[24px] leading-[30px] text-ink">
            Recent note sparks
          </Text>
          <Pressable
            onPress={onRefresh}
            disabled={loading}
            className="rounded-full bg-sand px-4 py-2"
          >
            <Text className="text-[13px] font-bold text-ink">
              {loading ? "Refreshing..." : "Refresh"}
            </Text>
          </Pressable>
        </View>

        {recentHighlights.length === 0 ? (
          <Text className="font-body text-[15px] leading-6 text-walnut">
            Your recent notes will appear here once you start saving reflections.
          </Text>
        ) : (
          <View className="gap-3">
            {recentHighlights.map((note) => (
              <Pressable
                className="rounded-[20px] border border-line bg-white/70 px-4 py-4"
                key={
                  note?._id ||
                  note?.id ||
                  `${note?.chapterId || "note"}-${note?.updatedAt || note?.createdAt || note?.title || "item"}`
                }
                onPress={() =>
                  navigation.getParent()?.navigate("Notes", {
                    screen: "NoteDetail",
                    params: {
                      noteId: note?._id || note?.id,
                      note,
                    },
                  })
                }
              >
                <Text className="mb-1 font-semibold text-[16px] text-ink">
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

export default HomeScreen;
