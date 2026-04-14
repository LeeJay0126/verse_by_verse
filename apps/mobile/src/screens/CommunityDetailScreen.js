import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import SectionCard from "../components/SectionCard";

const CommunityDetailScreen = ({ route, navigation, communityApi, user }) => {
  const initialCommunity = route?.params?.community || null;
  const communityId = initialCommunity?.id || route?.params?.communityId || "";

  const [community, setCommunity] = React.useState(initialCommunity);
  const [loading, setLoading] = React.useState(!initialCommunity);
  const [joining, setJoining] = React.useState(false);
  const [joinState, setJoinState] = React.useState("idle");
  const [error, setError] = React.useState("");

  const currentUserId = String(user?.id || user?._id || "");

  const loadCommunity = React.useCallback(async () => {
    if (!communityId) return;

    try {
      setLoading(true);
      setError("");
      const nextCommunity = await communityApi.getCommunity(communityId);
      setCommunity(nextCommunity);
    } catch (err) {
      setError(err?.message || "Unable to load community.");
    } finally {
      setLoading(false);
    }
  }, [communityApi, communityId]);

  React.useEffect(() => {
    loadCommunity();
  }, [loadCommunity]);

  const isMember = React.useMemo(() => {
    const members = Array.isArray(community?.membersList) ? community.membersList : [];
    return members.some((member) => String(member?.id || member?._id || "") === currentUserId);
  }, [community, currentUserId]);

  const handleJoin = async () => {
    if (!communityId || joining || isMember || joinState === "requested") return;

    try {
      setJoining(true);
      setError("");
      await communityApi.requestJoin(communityId);
      setJoinState("requested");
    } catch (err) {
      setError(err?.message || "Unable to request to join.");
    } finally {
      setJoining(false);
    }
  };

  if (loading && !community) {
    return (
      <View className="flex-1 items-center justify-center bg-parchment px-6">
        <ActivityIndicator color="#8f6840" />
        <Text className="mt-4 font-body text-[15px] leading-6 text-walnut">
          Loading community...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
        <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
          Community details
        </Text>
        <Text className="mb-3 font-display text-[32px] leading-[38px] text-ink">
          {community?.header || "Community"}
        </Text>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          {community?.subheader || "See what this group is about before you join in."}
        </Text>
      </View>

      <SectionCard>
        <View className="flex-row flex-wrap gap-2">
          <View className="rounded-full bg-sand px-4 py-3">
            <Text className="text-[13px] font-bold text-ink">{community?.type || "Community"}</Text>
          </View>
          <View className="rounded-full bg-sand px-4 py-3">
            <Text className="text-[13px] font-bold text-ink">
              {community?.membersCount || 0} member{community?.membersCount === 1 ? "" : "s"}
            </Text>
          </View>
          <View className="rounded-full bg-sand px-4 py-3">
            <Text className="text-[13px] font-bold text-ink">
              {community?.lastActive || "Recently active"}
            </Text>
          </View>
        </View>
        <Text className="mt-4 font-body text-[15px] leading-6 text-walnut">
          {community?.content || "No description has been added yet."}
        </Text>
      </SectionCard>

      <SectionCard tone="soft">
        <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">People</Text>
        <Text className="font-display text-[24px] leading-[30px] text-ink">
          {community?.owner?.username || community?.owner?.fullName || "Community owner"}
        </Text>
        <Text className="font-body text-[14px] leading-6 text-walnut">
          Owner
          {Array.isArray(community?.leaders) && community.leaders.length
            ? ` · ${community.leaders.length} leader${community.leaders.length === 1 ? "" : "s"}`
            : ""}
        </Text>
      </SectionCard>

      {!!error && (
        <SectionCard>
          <Text className="font-body text-[14px] leading-5 text-danger">{error}</Text>
        </SectionCard>
      )}

      <SectionCard>
        {isMember ? (
          <View className="gap-3">
            <Text className="font-body text-[15px] leading-6 text-walnut">
              You are already in this community. Head into the posts and catch up with the latest
              conversations.
            </Text>
            <Pressable
              onPress={() => navigation.navigate("CommunityPosts", { community })}
              className="rounded-full bg-ink px-5 py-4"
            >
              <Text className="text-center text-[15px] font-bold text-cream">Go to posts</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-3">
            <Text className="font-body text-[15px] leading-6 text-walnut">
              Request to join if this feels like the right place to study and reflect with others.
            </Text>
            {joinState === "requested" ? (
              <Text className="font-body text-[14px] leading-6 text-walnut">
                Your request is in. Once a leader approves it, you will be able to vote, reply,
                and share study responses in the mobile app.
              </Text>
            ) : null}
            <Pressable
              onPress={handleJoin}
              disabled={joining || joinState === "requested"}
              className={`rounded-full px-5 py-4 ${
                joinState === "requested" ? "bg-sand" : "bg-ink"
              }`}
            >
              <Text
                className={`text-center text-[15px] font-bold ${
                  joinState === "requested" ? "text-ink" : "text-cream"
                }`}
              >
                {joining
                  ? "Sending request..."
                  : joinState === "requested"
                    ? "Request sent"
                    : "Request to join"}
              </Text>
            </Pressable>
          </View>
        )}
      </SectionCard>
    </ScrollView>
  );
};

export default CommunityDetailScreen;
