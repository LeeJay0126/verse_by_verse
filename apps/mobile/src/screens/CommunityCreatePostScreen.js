import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import SectionCard from "../components/SectionCard";

const POST_TYPES = [
  {
    value: "questions",
    label: "Question",
    description: "Ask the group something and invite discussion.",
  },
  {
    value: "announcements",
    label: "Announcement",
    description: "Share something important everyone should see.",
  },
  {
    value: "poll",
    label: "Poll",
    description: "Let the community vote on a decision or preference.",
  },
];

const emptyPollOptions = ["", ""];

const CommunityCreatePostScreen = ({ route, navigation, communityApi }) => {
  const community = route?.params?.community || {};
  const communityId = community?.id || route?.params?.communityId || "";

  const [type, setType] = React.useState("questions");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [pollOptions, setPollOptions] = React.useState(emptyPollOptions);
  const [allowMultiple, setAllowMultiple] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const typeConfig = POST_TYPES.find((item) => item.value === type) || POST_TYPES[0];

  const updatePollOption = (index, value) => {
    setPollOptions((current) => current.map((option, optionIndex) => (optionIndex === index ? value : option)));
  };

  const addPollOption = () => {
    setPollOptions((current) => [...current, ""]);
  };

  const removePollOption = (index) => {
    setPollOptions((current) => {
      if (current.length <= 2) return current;
      return current.filter((_, optionIndex) => optionIndex !== index);
    });
  };

  const handleSubmit = async () => {
    if (!communityId || submitting) return;

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        title: title.trim(),
        type,
        body: body.trim(),
      };

      if (type === "poll") {
        payload.poll = {
          options: pollOptions.map((option) => option.trim()).filter(Boolean),
          allowMultiple,
        };
      }

      const result = await communityApi.createPost(communityId, payload);

      navigation.replace("CommunityPostDetail", {
        community,
        communityId,
        postId: result.postId,
      });
    } catch (err) {
      setError(err?.message || "Unable to publish this post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
        <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
          New community post
        </Text>
        <Text className="mb-3 font-display text-[32px] leading-[38px] text-ink">
          {community?.header || "Community"}
        </Text>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          Start a conversation that fits the rhythm of this group. This first mobile composer
          covers questions, announcements, and polls.
        </Text>
      </View>

      {!!error && (
        <SectionCard>
          <Text className="font-body text-[14px] leading-5 text-danger">{error}</Text>
        </SectionCard>
      )}

      <SectionCard>
        <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
          Post type
        </Text>
        <View className="mt-2 gap-3">
          {POST_TYPES.map((option) => {
            const active = option.value === type;
            return (
              <Pressable
                key={option.value}
                onPress={() => setType(option.value)}
                className={`rounded-[24px] border px-4 py-4 ${
                  active ? "border-ink bg-white" : "border-line bg-sand/60"
                }`}
              >
                <Text className="text-[15px] font-bold text-ink">{option.label}</Text>
                <Text className="mt-1 font-body text-[14px] leading-6 text-walnut">
                  {option.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard tone="soft">
        <Text className="font-display text-[24px] leading-[30px] text-ink">
          {typeConfig.label}
        </Text>
        <Text className="font-body text-[14px] leading-6 text-walnut">
          {type === "poll"
            ? "Give the group a clear prompt and at least two choices."
            : "Keep it clear and inviting so people know how to respond."}
        </Text>

        <View className="mt-4 gap-4">
          <View>
            <Text className="mb-2 text-[12px] font-bold uppercase tracking-[1px] text-amber">
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Add a title"
              className="rounded-2xl border border-lineStrong bg-white px-4 py-4 text-[15px] text-ink"
              placeholderTextColor="#8a7868"
            />
          </View>

          <View>
            <Text className="mb-2 text-[12px] font-bold uppercase tracking-[1px] text-amber">
              {type === "poll" ? "Prompt" : "Body"}
            </Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder={
                type === "poll"
                  ? "What do you want the group to decide?"
                  : "Write the message you want to share"
              }
              multiline
              textAlignVertical="top"
              className="min-h-[140px] rounded-[24px] border border-lineStrong bg-white px-4 py-4 text-[15px] leading-6 text-ink"
              placeholderTextColor="#8a7868"
            />
          </View>
        </View>
      </SectionCard>

      {type === "poll" ? (
        <SectionCard>
          <Text className="font-display text-[24px] leading-[30px] text-ink">Poll options</Text>
          <View className="mt-4 gap-3">
            {pollOptions.map((option, index) => (
              <View key={`poll-option-${index}`} className="gap-2">
                <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                  Option {index + 1}
                </Text>
                <TextInput
                  value={option}
                  onChangeText={(value) => updatePollOption(index, value)}
                  placeholder={`Choice ${index + 1}`}
                  className="rounded-2xl border border-lineStrong bg-white px-4 py-4 text-[15px] text-ink"
                  placeholderTextColor="#8a7868"
                />
                {pollOptions.length > 2 ? (
                  <Pressable onPress={() => removePollOption(index)} className="self-start rounded-full bg-sand px-4 py-2">
                    <Text className="text-[13px] font-bold text-ink">Remove option</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>

          <View className="mt-4 flex-row flex-wrap gap-3">
            <Pressable onPress={addPollOption} className="rounded-full bg-sand px-4 py-3">
              <Text className="text-[13px] font-bold text-ink">Add option</Text>
            </Pressable>
          </View>

          <View className="mt-5 flex-row items-center justify-between gap-4 rounded-[20px] border border-line bg-white/70 px-4 py-4">
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-ink">Allow multiple selections</Text>
              <Text className="mt-1 font-body text-[14px] leading-6 text-walnut">
                Let members vote for more than one option.
              </Text>
            </View>
            <Switch value={allowMultiple} onValueChange={setAllowMultiple} />
          </View>
        </SectionCard>
      ) : null}

      <SectionCard tone="soft">
        <View className="flex-row flex-wrap gap-3">
          <Pressable
            onPress={() => navigation.goBack()}
            disabled={submitting}
            className="rounded-full bg-sand px-5 py-3"
          >
            <Text className="text-[14px] font-bold text-ink">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className={`rounded-full px-5 py-3 ${submitting ? "bg-line" : "bg-ink"}`}
          >
            <View className="flex-row items-center gap-2">
              {submitting ? <ActivityIndicator size="small" color="#fffaf3" /> : null}
              <Text className="text-[14px] font-bold text-cream">
                {submitting ? "Publishing..." : "Publish post"}
              </Text>
            </View>
          </Pressable>
        </View>
      </SectionCard>
    </ScrollView>
  );
};

export default CommunityCreatePostScreen;
