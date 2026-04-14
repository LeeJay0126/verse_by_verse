import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import SectionCard from "../components/SectionCard";

const ROOT_REPLIES_PER_PAGE = 8;
const MAX_REPLY_DEPTH = 4;

const buildReplyTree = (replies) => {
  const byParent = new Map();
  const roots = [];

  (replies || []).forEach((reply) => {
    const parentId = reply?.parentReplyId || "";
    if (!parentId) {
      roots.push(reply);
      return;
    }
    if (!byParent.has(parentId)) byParent.set(parentId, []);
    byParent.get(parentId).push(reply);
  });

  const attachChildren = (reply, depth = 0) => ({
    ...reply,
    depth,
    children: (byParent.get(String(reply.id)) || []).map((child) =>
      attachChildren(child, Math.min(depth + 1, MAX_REPLY_DEPTH))
    ),
  });

  return roots.map((reply) => attachChildren(reply, 0));
};

const flattenReplyTree = (items) => {
  const result = [];

  const walk = (reply) => {
    result.push(reply);
    (reply.children || []).forEach(walk);
  };

  (items || []).forEach(walk);
  return result;
};

const CommunityPostDetailScreen = ({ route, communityApi }) => {
  const initialCommunity = route?.params?.community || null;
  const initialPost = route?.params?.post || null;
  const communityId = initialCommunity?.id || route?.params?.communityId || "";
  const postId = initialPost?.id || route?.params?.postId || "";

  const [community, setCommunity] = React.useState(initialCommunity);
  const [post, setPost] = React.useState(initialPost);
  const [replies, setReplies] = React.useState([]);
  const [myUserId, setMyUserId] = React.useState("");
  const [replyMeta, setReplyMeta] = React.useState({
    page: 1,
    totalPages: 1,
    totalRootReplies: 0,
  });
  const [replyBody, setReplyBody] = React.useState("");
  const [replySubmitting, setReplySubmitting] = React.useState(false);
  const [activeReplyTo, setActiveReplyTo] = React.useState("");
  const [childReplyBody, setChildReplyBody] = React.useState("");
  const [editingReplyId, setEditingReplyId] = React.useState("");
  const [editBody, setEditBody] = React.useState("");
  const [editSubmitting, setEditSubmitting] = React.useState(false);
  const [deletingReplyId, setDeletingReplyId] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const loadDetail = React.useCallback(
    async (replyPage = 1, options = {}) => {
      const { withSpinner = true } = options;

      try {
        if (withSpinner) setLoading(true);
        setError("");

        const [{ community: nextCommunity, post: nextPost }, nextReplies] = await Promise.all([
          communityApi.getPostDetail(communityId, postId),
          communityApi.listReplies(communityId, postId, {
            page: replyPage,
            limit: ROOT_REPLIES_PER_PAGE,
          }),
        ]);

        setCommunity(nextCommunity);
        setPost(nextPost);
        setReplies(nextReplies.replies);
        setMyUserId(nextReplies.myUserId || "");
        setReplyMeta({
          page: nextReplies.page,
          totalPages: nextReplies.totalPages,
          totalRootReplies: nextReplies.totalRootReplies,
        });
      } catch (err) {
        setError(err?.message || "Unable to load this post.");
      } finally {
        if (withSpinner) setLoading(false);
      }
    },
    [communityApi, communityId, postId]
  );

  React.useEffect(() => {
    loadDetail(1);
  }, [loadDetail]);

  const bodyParagraphs = React.useMemo(() => {
    return String(post?.body || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [post?.body]);

  const structuredQuestions = Array.isArray(post?.studyContent?.questions)
    ? post.studyContent.questions.filter((item) => String(item || "").trim())
    : [];
  const structuredVerses = Array.isArray(post?.passageSnapshot?.verses)
    ? post.passageSnapshot.verses
    : [];
  const replyItems = React.useMemo(() => flattenReplyTree(buildReplyTree(replies)), [replies]);
  const canManageReply = React.useCallback(
    (reply) => {
      const authorId = String(reply?.authorId || "");
      return !!myUserId && !!authorId && myUserId === authorId;
    },
    [myUserId]
  );

  const handleSubmitReply = async () => {
    const body = replyBody.trim();
    if (!body) {
      setError("Write a reply before posting.");
      return;
    }

    try {
      setReplySubmitting(true);
      setError("");
      await communityApi.createReply(communityId, postId, { body });
      setReplyBody("");
      setActiveReplyTo("");
      setChildReplyBody("");
      await loadDetail(1, { withSpinner: false });
    } catch (err) {
      setError(err?.message || "Unable to post reply.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleSubmitChildReply = async (parentReplyId) => {
    const body = childReplyBody.trim();
    if (!body) {
      setError("Write a reply before posting.");
      return;
    }

    try {
      setReplySubmitting(true);
      setError("");
      await communityApi.createReply(communityId, postId, {
        body,
        parentReplyId,
      });
      setActiveReplyTo("");
      setChildReplyBody("");
      await loadDetail(replyMeta.page, { withSpinner: false });
    } catch (err) {
      setError(err?.message || "Unable to post reply.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleSaveEdit = async (replyId) => {
    const body = editBody.trim();
    if (!body) {
      setError("Write a reply before saving.");
      return;
    }

    try {
      setEditSubmitting(true);
      setError("");
      await communityApi.updateReply(communityId, postId, replyId, { body });
      setEditingReplyId("");
      setEditBody("");
      await loadDetail(replyMeta.page, { withSpinner: false });
    } catch (err) {
      setError(err?.message || "Unable to update reply.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      setDeletingReplyId(String(replyId));
      setError("");
      await communityApi.deleteReply(communityId, postId, replyId);
      if (editingReplyId === String(replyId)) {
        setEditingReplyId("");
        setEditBody("");
      }
      if (activeReplyTo === String(replyId)) {
        setActiveReplyTo("");
        setChildReplyBody("");
      }
      await loadDetail(replyMeta.page, { withSpinner: false });
    } catch (err) {
      setError(err?.message || "Unable to delete reply.");
    } finally {
      setDeletingReplyId("");
    }
  };

  if (loading && !post) {
    return (
      <View className="flex-1 items-center justify-center bg-parchment px-6">
        <ActivityIndicator color="#8f6840" />
        <Text className="mt-4 font-body text-[15px] leading-6 text-walnut">Loading post...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ padding: 20, gap: 18 }}>
      <View className="rounded-[32px] border border-line bg-cream px-6 py-7 shadow-soft">
        <Text className="mb-3 text-[12px] font-bold uppercase tracking-[2px] text-amber">
          {community?.header || "Community"}
        </Text>
        <Text className="mb-3 font-display text-[32px] leading-[38px] text-ink">
          {post?.title || "Post"}
        </Text>
        <Text className="font-body text-[15px] leading-6 text-walnut">
          {post?.authorName || "Unknown"} · {post?.activityLabel || "Recently active"}
        </Text>
      </View>

      {!!error && (
        <SectionCard>
          <Text className="font-body text-[14px] leading-5 text-danger">{error}</Text>
        </SectionCard>
      )}

      <SectionCard>
        <View className="flex-row flex-wrap gap-2">
          <View className="rounded-full bg-sand px-4 py-3">
            <Text className="text-[13px] font-bold text-ink">
              {post?.category || post?.type || "Post"}
            </Text>
          </View>
          <View className="rounded-full bg-sand px-4 py-3">
            <Text className="text-[13px] font-bold text-ink">
              {post?.replyCount || 0} repl{post?.replyCount === 1 ? "y" : "ies"}
            </Text>
          </View>
        </View>

        {!!bodyParagraphs.length && (
          <View className="mt-4 gap-3">
            {bodyParagraphs.map((paragraph, index) => (
              <Text key={`${index}-${paragraph}`} className="font-body text-[15px] leading-7 text-walnut">
                {paragraph}
              </Text>
            ))}
          </View>
        )}
      </SectionCard>

      {post?.type === "bible_study" &&
      (post?.passage?.referenceLabel ||
        structuredVerses.length ||
        post?.studyContent?.leaderNotes ||
        post?.studyContent?.reflection ||
        structuredQuestions.length) ? (
        <SectionCard tone="soft">
          <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">
            Bible study
          </Text>

          {!!post?.passage?.referenceLabel && (
            <Text className="mt-1 font-display text-[24px] leading-[30px] text-ink">
              {post.passage.referenceLabel}
            </Text>
          )}

          {!!structuredVerses.length && (
            <View className="mt-4 gap-3">
              {structuredVerses.map((verse) => (
                <Text
                  key={`${post?.id || "post"}-${verse.number}`}
                  className="font-body text-[15px] leading-7 text-walnut"
                >
                  <Text className="text-amber">{verse.number} </Text>
                  {verse.text}
                </Text>
              ))}
            </View>
          )}

          {!!post?.studyContent?.leaderNotes && (
            <View className="mt-5 gap-2">
              <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                Leader notes
              </Text>
              <Text className="font-body text-[15px] leading-7 text-walnut">
                {post.studyContent.leaderNotes}
              </Text>
            </View>
          )}

          {!!post?.studyContent?.reflection && (
            <View className="mt-5 gap-2">
              <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                Reflection
              </Text>
              <Text className="font-body text-[15px] leading-7 text-walnut">
                {post.studyContent.reflection}
              </Text>
            </View>
          )}

          {!!structuredQuestions.length && (
            <View className="mt-5 gap-2">
              <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                Discussion questions
              </Text>
              <View className="gap-3">
                {structuredQuestions.map((question, index) => (
                  <Text
                    key={`${index}-${question}`}
                    className="font-body text-[15px] leading-7 text-walnut"
                  >
                    {index + 1}. {question}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </SectionCard>
      ) : null}

      {post?.type === "poll" && Array.isArray(post?.poll?.options) && post.poll.options.length ? (
        <SectionCard tone="soft">
          <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">Poll</Text>
          <View className="mt-4 gap-3">
            {post.poll.options.map((option, index) => {
              const count = post?.pollResults?.counts?.[index] || 0;
              const totalVotes = post?.pollResults?.totalVotes || 0;
              const percentage = totalVotes ? Math.round((count / totalVotes) * 100) : 0;

              return (
                <View key={`${index}-${option?.text || "option"}`} className="rounded-[20px] bg-white/80 px-4 py-4">
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="flex-1 font-semibold text-[15px] text-ink">
                      {option?.text || "Option"}
                    </Text>
                    <Text className="text-[12px] font-bold text-amber">
                      {count} vote{count === 1 ? "" : "s"} · {percentage}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <Text className="mt-4 font-body text-[14px] leading-6 text-walnut">
            {post?.poll?.allowMultiple
              ? "This poll allows multiple selections."
              : "This poll allows one selection."}
          </Text>
        </SectionCard>
      ) : null}

      <SectionCard>
        <Text className="font-display text-[24px] leading-[30px] text-ink">Replies</Text>
        <Text className="mt-1 font-body text-[14px] leading-6 text-walnut">
          {replyMeta.totalRootReplies
            ? `${replyMeta.totalRootReplies} conversation starter${
                replyMeta.totalRootReplies === 1 ? "" : "s"
              } on this post`
            : "No replies yet"}
        </Text>

        <View className="mt-4 gap-3">
          <TextInput
            value={replyBody}
            onChangeText={setReplyBody}
            placeholder="Add a reply to this post"
            multiline
            textAlignVertical="top"
            className="min-h-[120px] rounded-[24px] border border-lineStrong bg-white px-4 py-4 text-[15px] leading-6 text-ink"
            placeholderTextColor="#8a7868"
          />
          <Pressable
            onPress={handleSubmitReply}
            disabled={replySubmitting}
            className={`self-start rounded-full bg-ink px-5 py-3 ${
              replySubmitting ? "opacity-65" : ""
            }`}
          >
            <Text className="text-[14px] font-bold text-cream">
              {replySubmitting ? "Posting..." : "Post reply"}
            </Text>
          </Pressable>
        </View>

        <View className="mt-4 gap-3">
          {replyItems.map((reply) => (
            <View
              key={reply.id}
              className="rounded-[20px] border border-line bg-white/70 px-4 py-4"
              style={{ marginLeft: Math.min(Number(reply.depth || 0) * 14, 42) }}
            >
              <View className="flex-row items-center justify-between gap-3">
                <Text className="font-semibold text-[15px] text-ink">{reply.author || "Unknown"}</Text>
                <Text className="text-[12px] font-bold text-amber">
                  {reply.activityLabel || "Recently active"}
                </Text>
              </View>
              <Text className="mt-3 font-body text-[15px] leading-7 text-walnut">
                {editingReplyId === String(reply.id) ? "" : reply.body || ""}
              </Text>
              {reply.replyType === "study_share" && (
                <Text className="mt-3 text-[12px] font-bold uppercase tracking-[1px] text-amber">
                  Bible study share
                </Text>
              )}
              {editingReplyId === String(reply.id) && (
                <View className="mt-3 gap-3">
                  <TextInput
                    value={editBody}
                    onChangeText={setEditBody}
                    multiline
                    textAlignVertical="top"
                    className="min-h-[100px] rounded-[20px] border border-lineStrong bg-cream px-4 py-4 text-[15px] leading-6 text-ink"
                    placeholder="Edit your reply"
                    placeholderTextColor="#8a7868"
                  />
                  <View className="flex-row flex-wrap gap-2">
                    <Pressable
                      onPress={() => handleSaveEdit(reply.id)}
                      disabled={editSubmitting}
                      className={`rounded-full bg-ink px-4 py-3 ${editSubmitting ? "opacity-65" : ""}`}
                    >
                      <Text className="text-[13px] font-bold text-cream">
                        {editSubmitting ? "Saving..." : "Save"}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setEditingReplyId("");
                        setEditBody("");
                      }}
                      className="rounded-full bg-sand px-4 py-3"
                    >
                      <Text className="text-[13px] font-bold text-ink">Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              <View className="mt-4 flex-row flex-wrap gap-2">
                <Pressable
                  onPress={() => {
                    setEditingReplyId("");
                    setEditBody("");
                    setActiveReplyTo((current) => (current === String(reply.id) ? "" : String(reply.id)));
                    setChildReplyBody("");
                  }}
                  className="rounded-full bg-sand px-4 py-3"
                >
                  <Text className="text-[13px] font-bold text-ink">
                    {activeReplyTo === String(reply.id) ? "Close reply" : "Reply"}
                  </Text>
                </Pressable>
                {canManageReply(reply) && reply.replyType !== "study_share" && (
                  <>
                    <Pressable
                      onPress={() => {
                        setActiveReplyTo("");
                        setChildReplyBody("");
                        setEditingReplyId(String(reply.id));
                        setEditBody(reply.body || "");
                      }}
                      className="rounded-full bg-sand px-4 py-3"
                    >
                      <Text className="text-[13px] font-bold text-ink">Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteReply(reply.id)}
                      disabled={deletingReplyId === String(reply.id)}
                      className={`rounded-full bg-sand px-4 py-3 ${
                        deletingReplyId === String(reply.id) ? "opacity-65" : ""
                      }`}
                    >
                      <Text className="text-[13px] font-bold text-danger">
                        {deletingReplyId === String(reply.id) ? "Deleting..." : "Delete"}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
              {activeReplyTo === String(reply.id) && (
                <View className="mt-4 gap-3 rounded-[20px] border border-line bg-cream px-4 py-4">
                  <TextInput
                    value={childReplyBody}
                    onChangeText={setChildReplyBody}
                    placeholder="Reply to this message"
                    multiline
                    textAlignVertical="top"
                    className="min-h-[96px] rounded-[18px] border border-lineStrong bg-white px-4 py-4 text-[15px] leading-6 text-ink"
                    placeholderTextColor="#8a7868"
                  />
                  <View className="flex-row flex-wrap gap-2">
                    <Pressable
                      onPress={() => handleSubmitChildReply(reply.id)}
                      disabled={replySubmitting}
                      className={`rounded-full bg-ink px-4 py-3 ${replySubmitting ? "opacity-65" : ""}`}
                    >
                      <Text className="text-[13px] font-bold text-cream">
                        {replySubmitting ? "Posting..." : "Post child reply"}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setActiveReplyTo("");
                        setChildReplyBody("");
                      }}
                      className="rounded-full bg-sand px-4 py-3"
                    >
                      <Text className="text-[13px] font-bold text-ink">Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {replyMeta.totalPages > 1 && (
          <View className="mt-4 flex-row items-center justify-between gap-3">
            <Pressable
              onPress={() => loadDetail(Math.max(1, replyMeta.page - 1))}
              disabled={replyMeta.page <= 1}
              className={`rounded-full px-5 py-3 ${
                replyMeta.page > 1 ? "bg-ink" : "bg-line"
              }`}
            >
              <Text className="text-[14px] font-bold text-cream">Prev</Text>
            </Pressable>
            <Text className="font-body text-[14px] leading-6 text-walnut">
              Page {replyMeta.page} of {replyMeta.totalPages}
            </Text>
            <Pressable
              onPress={() => loadDetail(Math.min(replyMeta.totalPages, replyMeta.page + 1))}
              disabled={replyMeta.page >= replyMeta.totalPages}
              className={`rounded-full px-5 py-3 ${
                replyMeta.page < replyMeta.totalPages ? "bg-ink" : "bg-line"
              }`}
            >
              <Text className="text-[14px] font-bold text-cream">Next</Text>
            </Pressable>
          </View>
        )}
      </SectionCard>
    </ScrollView>
  );
};

export default CommunityPostDetailScreen;
