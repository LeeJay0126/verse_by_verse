import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import SectionCard from "../components/SectionCard";
import CommunityCard from "../components/CommunityCard";
import { getAssetUrl } from "@verse/shared";

const CommunityBrowseScreen = ({ communityApi, navigation }) => {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [communities, setCommunities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState("");

  const loadCommunities = React.useCallback(
    async (nextSearch = search, nextType = typeFilter, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError("");

        const nextCommunities = await communityApi.listDiscover({
          q: nextSearch.trim(),
          type: nextType,
        });

        setCommunities(nextCommunities);
      } catch (err) {
        setCommunities([]);
        setError(err?.message || "Unable to load communities.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [communityApi, search, typeFilter]
  );

  React.useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
        <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
          Community
        </Text>
        <Text className="mb-3 font-display text-[34px] leading-[40px] text-ink">
          Find people to read with.
        </Text>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          Browse communities, see what kind of space each one offers, and request to join the ones
          that fit your study rhythm.
        </Text>
      </View>

      <SectionCard>
        <View className="gap-3">
          <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
            Explore communities
          </Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or topic"
            className="rounded-2xl border border-lineStrong bg-white px-4 py-4 text-[16px] text-ink"
            placeholderTextColor="#8a7868"
          />
          <View className="flex-row flex-wrap gap-2">
            {["", "Bible Study", "Prayer Group", "Church Organization", "Read Through"].map(
              (type) => {
                const active = typeFilter === type;
                const label = type || "Any type";
                return (
                  <Pressable
                    key={label}
                    onPress={() => setTypeFilter(type)}
                    className={`rounded-full px-4 py-3 ${
                      active ? "bg-ink" : "bg-sand"
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-bold ${
                        active ? "text-cream" : "text-ink"
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => loadCommunities(search, typeFilter)}
              className="flex-1 rounded-full bg-ink px-5 py-4"
            >
              <Text className="text-center text-[15px] font-bold text-cream">Search</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("MyCommunities")}
              className="rounded-full bg-sand px-5 py-4"
            >
              <Text className="text-[15px] font-bold text-ink">My groups</Text>
            </Pressable>
          </View>
        </View>
      </SectionCard>

      <SectionCard tone="soft">
        <View className="flex-row items-center justify-between">
          <Text className="font-display text-[24px] leading-[30px] text-ink">
            Browse communities
          </Text>
          {(loading || refreshing) && <ActivityIndicator color="#8f6840" />}
        </View>
        {!!error && (
          <Text className="mt-2 font-body text-[14px] leading-5 text-danger">{error}</Text>
        )}
        {!loading && !communities.length && !error ? (
          <Text className="mt-2 font-body text-[15px] leading-6 text-walnut">
            No communities matched that search yet.
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
            actionLabel="View details"
            onPress={() => navigation.navigate("CommunityDetail", { community })}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default CommunityBrowseScreen;
