import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import SectionCard from "../components/SectionCard";
import CommunityCard from "../components/CommunityCard";
import { getAssetUrl } from "@verse/shared";

const MyCommunitiesScreen = ({ communityApi, navigation }) => {
  const [communities, setCommunities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const loadCommunities = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const nextCommunities = await communityApi.listMine();
      setCommunities(nextCommunities);
    } catch (err) {
      setCommunities([]);
      setError(err?.message || "Unable to load your communities.");
    } finally {
      setLoading(false);
    }
  }, [communityApi]);

  React.useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
        <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
          My communities
        </Text>
        <Text className="mb-3 font-display text-[32px] leading-[38px] text-ink">
          Keep your groups close.
        </Text>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          Jump back into the communities you already belong to and open the latest posts from
          there.
        </Text>
      </View>

      <SectionCard tone="soft">
        <View className="flex-row items-center justify-between">
          <Text className="font-display text-[24px] leading-[30px] text-ink">
            Joined communities
          </Text>
          <Pressable onPress={loadCommunities} className="rounded-full bg-sand px-4 py-2">
            <Text className="text-[13px] font-bold text-ink">Refresh</Text>
          </Pressable>
        </View>
        {loading && (
          <View className="mt-3 flex-row items-center gap-3">
            <ActivityIndicator color="#8f6840" />
            <Text className="font-body text-[15px] leading-6 text-walnut">
              Loading your communities...
            </Text>
          </View>
        )}
        {!!error && (
          <Text className="mt-3 font-body text-[14px] leading-5 text-danger">{error}</Text>
        )}
        {!loading && !communities.length && !error ? (
          <Text className="mt-3 font-body text-[15px] leading-6 text-walnut">
            You have not joined any communities yet.
          </Text>
        ) : null}
      </SectionCard>

      <View className="gap-4">
        {communities.map((community) => (
          <CommunityCard
            key={community.id}
            title={community.header}
            subtitle={community.subheader}
            description={community.content}
            type={community.type}
            membersCount={community.membersCount}
            lastActive={community.lastActive}
            heroImageUrl={getAssetUrl(community.heroImageUrl)}
            actionLabel="Open posts"
            onPress={() => navigation.navigate("CommunityPosts", { community })}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default MyCommunitiesScreen;
