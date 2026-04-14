import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import SectionCard from "../components/SectionCard";

const POSTS_PER_PAGE = 12;
const formatPostTypeLabel = (type, fallback) => {
  if (fallback) return fallback;
  if (type === "bible_study") return "Bible Study";
  if (type === "poll") return "Poll";
  if (type === "announcements") return "Announcement";
  if (type === "questions") return "Question";
  return "Post";
};

const CommunityPostsScreen = ({ route, navigation, communityApi }) => {
  const community = route?.params?.community || {};
  const communityId = community?.id || route?.params?.communityId || "";

  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const loadPosts = React.useCallback(
    async (nextPage = page) => {
      if (!communityId) return;

      try {
        setLoading(true);
        setError("");
        const result = await communityApi.listPosts(communityId, {
          page: nextPage,
          limit: POSTS_PER_PAGE,
        });
        setPosts(result.posts);
        setMeta({
          page: result.page,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
        });
      } catch (err) {
        setPosts([]);
        setError(err?.message || "Unable to load community posts.");
      } finally {
        setLoading(false);
      }
    },
    [communityApi, communityId, page]
  );

  React.useEffect(() => {
    loadPosts(page);
  }, [loadPosts, page]);

  useFocusEffect(
    React.useCallback(() => {
      loadPosts(page);
    }, [loadPosts, page])
  );

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
        <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
          Community posts
        </Text>
        <Text className="mb-3 font-display text-[32px] leading-[38px] text-ink">
          {community?.header || "Community"}
        </Text>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          Catch up on what the group is sharing, or start a new conversation when you are ready.
        </Text>
      </View>

      <SectionCard tone="soft">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="font-display text-[24px] leading-[30px] text-ink">Posts</Text>
            <Text className="font-body text-[14px] leading-6 text-walnut">
              {meta.totalCount
                ? `Page ${meta.page} of ${meta.totalPages} · ${meta.totalCount} total posts`
                : "No posts yet"}
            </Text>
          </View>
          {loading && <ActivityIndicator color="#8f6840" />}
        </View>
        <Pressable
          onPress={() => navigation.navigate("CommunityCreatePost", { community, communityId })}
          className="self-start rounded-full bg-ink px-5 py-3"
        >
          <Text className="text-[14px] font-bold text-cream">Create post</Text>
        </Pressable>
      </SectionCard>

      {!!error && (
        <SectionCard>
          <Text className="font-body text-[14px] leading-5 text-danger">{error}</Text>
        </SectionCard>
      )}

      {!loading && !posts.length && !error ? (
        <SectionCard>
          <Text className="font-body text-[15px] leading-6 text-walnut">
            There are no visible posts in this community yet.
          </Text>
        </SectionCard>
      ) : null}

      <View className="gap-4">
        {posts.map((post) => (
          <Pressable
            key={post.id}
            onPress={() =>
              navigation.navigate("CommunityPostDetail", {
                community,
                communityId,
                post,
                postId: post.id,
              })
            }
          >
            <SectionCard>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                    {formatPostTypeLabel(post.type, post.category)}
                  </Text>
                  <Text className="mt-1 font-display text-[24px] leading-[30px] text-ink">
                    {post.title || "Untitled"}
                  </Text>
                </View>
                <View className="rounded-full bg-sand px-3 py-2">
                  <Text className="text-[12px] font-bold text-ink">
                    {post.replyCount || 0} repl{post.replyCount === 1 ? "y" : "ies"}
                  </Text>
                </View>
              </View>
              {!!post.subtitle && (
                <Text className="mt-3 font-body text-[15px] leading-6 text-walnut">
                  {post.subtitle}
                </Text>
              )}
              <View className="mt-4 flex-row flex-wrap gap-2">
                <View className="rounded-full bg-white/80 px-3 py-2">
                  <Text className="text-[12px] font-bold text-ink">
                    {post.authorName || "Unknown"}
                  </Text>
                </View>
                <View className="rounded-full bg-white/80 px-3 py-2">
                  <Text className="text-[12px] font-bold text-ink">
                    {post.activityLabel || "Recently active"}
                  </Text>
                </View>
              </View>
            </SectionCard>
          </Pressable>
        ))}
      </View>

      {meta.totalPages > 1 && (
        <SectionCard>
          <View className="flex-row items-center justify-between gap-3">
            <Pressable
              onPress={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className={`rounded-full px-5 py-3 ${page > 1 ? "bg-ink" : "bg-line"}`}
            >
              <Text className="text-[14px] font-bold text-cream">Prev</Text>
            </Pressable>
            <Text className="font-body text-[14px] leading-6 text-walnut">
              Page {meta.page} of {meta.totalPages}
            </Text>
            <Pressable
              onPress={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
              disabled={page >= meta.totalPages}
              className={`rounded-full px-5 py-3 ${
                page < meta.totalPages ? "bg-ink" : "bg-line"
              }`}
            >
              <Text className="text-[14px] font-bold text-cream">Next</Text>
            </Pressable>
          </View>
        </SectionCard>
      )}

      <SectionCard tone="soft">
        <Pressable
          onPress={() => navigation.navigate("MyCommunities")}
          className="self-start rounded-full bg-sand px-5 py-3"
        >
          <Text className="text-[14px] font-bold text-ink">Back to my communities</Text>
        </Pressable>
      </SectionCard>
    </ScrollView>
  );
};

export default CommunityPostsScreen;
