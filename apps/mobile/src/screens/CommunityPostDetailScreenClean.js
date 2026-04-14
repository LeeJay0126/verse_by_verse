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

const buildStudyAnswers = (questionCount, answers = []) =>
  Array.from({ length: questionCount }, (_, index) => {
    const value = answers?.[index];
    return typeof value === "string" ? value : "";
  });

const formatPostTypeLabel = (type, fallback) => {
  if (fallback) return fallback;
  if (type === "bible_study") return "Bible Study";
  if (type === "poll") return "Poll";
  if (type === "announcements") return "Announcement";
  if (type === "questions") return "Question";
  return "Post";
};

const needsCommunityMembership = (message) =>
  /join this community|must join this community/i.test(String(message || ""));

const CommunityPostDetailScreenClean = ({ route, communityApi }) => {
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
  const [pollSubmittingIndex, setPollSubmittingIndex] = React.useState(null);
  const [studySubmission, setStudySubmission] = React.useState(null);
  const [studyReflection, setStudyReflection] = React.useState("");
  const [studyAnswers, setStudyAnswers] = React.useState([]);
  const [studyLoading, setStudyLoading] = React.useState(false);
  const [studySubmitting, setStudySubmitting] = React.useState(false);
  const [studyStatus, setStudyStatus] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const bodyParagraphs = React.useMemo(() => {
    return String(post?.body || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [post?.body]);

  const structuredQuestions = React.useMemo(
    () =>
      Array.isArray(post?.studyContent?.questions)
        ? post.studyContent.questions.filter((item) => String(item || "").trim())
        : [],
    [post?.studyContent?.questions]
  );

  const structuredVerses = React.useMemo(
    () => (Array.isArray(post?.passageSnapshot?.verses) ? post.passageSnapshot.verses : []),
    [post?.passageSnapshot?.verses]
  );

  const selectedPollVotes = Array.isArray(post?.myVotes) ? post.myVotes : [];
  const replyItems = React.useMemo(() => flattenReplyTree(buildReplyTree(replies)), [replies]);
  const postTypeLabel = React.useMemo(
    () => formatPostTypeLabel(post?.type, post?.category),
    [post?.category, post?.type]
  );
  const showJoinHint = needsCommunityMembership(error);

  const syncStudyDraft = React.useCallback((submission, questionCount) => {
    setStudySubmission(submission || null);
    setStudyReflection(submission?.reflection || "");
    setStudyAnswers(buildStudyAnswers(questionCount, submission?.answers));
  }, []);

  const loadDetail = React.useCallback(
    async (replyPage = 1, options = {}) => {
      const { withSpinner = true, syncStudySubmission: shouldSyncStudySubmission = true } = options;

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

        if (shouldSyncStudySubmission && nextPost?.type === "bible_study") {
          setStudyLoading(true);
          const nextSubmission = await communityApi.getStudySubmissionMe(communityId, postId);
          const nextQuestions = Array.isArray(nextPost?.studyContent?.questions)
            ? nextPost.studyContent.questions.filter((item) => String(item || "").trim())
            : [];
          syncStudyDraft(nextSubmission, nextQuestions.length);
        } else if (shouldSyncStudySubmission && nextPost?.type !== "bible_study") {
          syncStudyDraft(null, 0);
        }
      } catch (err) {
        setError(err?.message || "Unable to load this post.");
      } finally {
        if (shouldSyncStudySubmission) setStudyLoading(false);
        if (withSpinner) setLoading(false);
      }
    },
    [communityApi, communityId, postId, syncStudyDraft]
  );

  React.useEffect(() => {
    loadDetail(1);
  }, [loadDetail]);

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
      await loadDetail(1, { withSpinner: false, syncStudySubmission: false });
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
      await loadDetail(replyMeta.page, { withSpinner: false, syncStudySubmission: false });
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
      await loadDetail(replyMeta.page, { withSpinner: false, syncStudySubmission: false });
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
      await loadDetail(replyMeta.page, { withSpinner: false, syncStudySubmission: false });
    } catch (err) {
      setError(err?.message || "Unable to delete reply.");
    } finally {
      setDeletingReplyId("");
    }
  };

  const handleVote = async (optionIndex) => {
    try {
      setPollSubmittingIndex(optionIndex);
      setError("");
      const result = await communityApi.voteOnPoll(communityId, postId, optionIndex);
      setPost((current) =>
        current
          ? {
              ...current,
              pollResults: result.pollResults,
              myVotes: result.myVotes,
            }
          : current
      );
    } catch (err) {
      setError(err?.message || "Unable to save your vote.");
    } finally {
      setPollSubmittingIndex(null);
    }
  };

  const handleStudyAnswerChange = (index, value) => {
    setStudyAnswers((current) => {
      const next = buildStudyAnswers(structuredQuestions.length, current);
      next[index] = value;
      return next;
    });
  };

  const handleSaveStudySubmission = async () => {
    try {
      setStudySubmitting(true);
      setStudyStatus("");
      setError("");

      const result = await communityApi.saveStudySubmission(communityId, postId, {
        reflection: studyReflection.trim(),
        answers: studyAnswers.map((item) => item.trim()),
      });

      syncStudyDraft(result?.submission || null, structuredQuestions.length);
      setStudyStatus("Your study response has been shared with the group.");
      await loadDetail(1, { withSpinner: false, syncStudySubmission: false });
    } catch (err) {
      setError(err?.message || "Unable to share your Bible study response.");
    } finally {
      setStudySubmitting(false);
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

      {showJoinHint && (
        <SectionCard tone="soft">
          <Text className="font-display text-[22px] leading-[28px] text-ink">
            Join this community first
          </Text>
          <Text className="font-body text-[14px] leading-6 text-walnut">
            Voting, replying, and Bible study sharing are only available to members. Head back to
            the community page if you need to request access.
          </Text>
        </SectionCard>
      )}

      <SectionCard>
        <View className="flex-row flex-wrap gap-2">
          <View className="rounded-full bg-sand px-4 py-3">
            <Text className="text-[13px] font-bold text-ink">{postTypeLabel}</Text>
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
              <Text
                key={`${index}-${paragraph}`}
                className="font-body text-[15px] leading-7 text-walnut"
              >
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
        <>
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

          <SectionCard>
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="font-display text-[24px] leading-[30px] text-ink">
                  Your study share
                </Text>
                <Text className="mt-1 font-body text-[14px] leading-6 text-walnut">
                  Write your own reflection here and it will appear in the discussion below.
                </Text>
              </View>
              {studyLoading ? <ActivityIndicator color="#8f6840" /> : null}
            </View>

            <View className="mt-4 gap-4">
              <View>
                <Text className="mb-2 text-[12px] font-bold uppercase tracking-[1px] text-amber">
                  Reflection
                </Text>
                <TextInput
                  value={studyReflection}
                  onChangeText={(value) => {
                    setStudyReflection(value);
                    setStudyStatus("");
                  }}
                  placeholder="What stood out to you in this passage?"
                  multiline
                  textAlignVertical="top"
                  className="min-h-[120px] rounded-[24px] border border-lineStrong bg-white px-4 py-4 text-[15px] leading-6 text-ink"
                  placeholderTextColor="#8a7868"
                />
              </View>

              {structuredQuestions.map((question, index) => (
                <View key={`${index}-${question}`}>
                  <Text className="mb-2 text-[12px] font-bold uppercase tracking-[1px] text-amber">
                    Question {index + 1}
                  </Text>
                  <Text className="mb-3 font-body text-[15px] leading-6 text-walnut">
                    {question}
                  </Text>
                  <TextInput
                    value={studyAnswers[index] || ""}
                    onChangeText={(value) => {
                      handleStudyAnswerChange(index, value);
                      setStudyStatus("");
                    }}
                    placeholder="Write your response"
                    multiline
                    textAlignVertical="top"
                    className="min-h-[110px] rounded-[24px] border border-lineStrong bg-white px-4 py-4 text-[15px] leading-6 text-ink"
                    placeholderTextColor="#8a7868"
                  />
                </View>
              ))}

              {!!studyStatus && (
                <Text className="font-body text-[14px] leading-5 text-emerald-800">
                  {studyStatus}
                </Text>
              )}

              {!!studySubmission?.id && (
                <View className="rounded-[20px] border border-line bg-white/80 px-4 py-4">
                  <Text className="text-[12px] font-bold uppercase tracking-[1px] text-amber">
                    Shared summary
                  </Text>
                  <Text className="mt-2 font-body text-[14px] leading-6 text-walnut">
                    {studySubmission?.reflection?.trim()
                      ? studySubmission.reflection.trim()
                      : "Your response is now part of the group conversation below."}
                  </Text>
                </View>
              )}

              {studySubmission?.updatedAt ? (
                <Text className="font-body text-[13px] leading-5 text-taupe">
                  Last saved to the conversation on{" "}
                  {new Date(studySubmission.updatedAt).toLocaleString()}.
                </Text>
              ) : (
                <Text className="font-body text-[13px] leading-5 text-taupe">
                  Save once and we will create your share in the group conversation.
                </Text>
              )}

              <Pressable
                onPress={handleSaveStudySubmission}
                disabled={studySubmitting || studyLoading}
                className={`self-start rounded-full px-5 py-3 ${
                  studySubmitting || studyLoading ? "bg-line" : "bg-ink"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  {studySubmitting ? <ActivityIndicator size="small" color="#fffaf3" /> : null}
                  <Text className="text-[14px] font-bold text-cream">
                    {studySubmitting
                      ? "Saving..."
                      : studySubmission?.id
                        ? "Update study share"
                        : "Share with group"}
                  </Text>
                </View>
              </Pressable>
            </View>
          </SectionCard>
        </>
      ) : null}

      {post?.type === "poll" && Array.isArray(post?.poll?.options) && post.poll.options.length ? (
        <SectionCard tone="soft">
          <Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-amber">Poll</Text>
          <Text className="mt-1 font-body text-[14px] leading-6 text-walnut">
            {post?.poll?.allowMultiple
              ? "Tap each option you want to support. Tap again to remove your vote."
              : "Tap an option to vote. Tapping your current choice removes it."}
          </Text>
          <View className="mt-4 gap-3">
            {post.poll.options.map((option, index) => {
              const count = post?.pollResults?.counts?.[index] || 0;
              const totalVotes = post?.pollResults?.totalVotes || 0;
              const percentage = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
              const selected = selectedPollVotes.includes(index);
              const isSubmitting = pollSubmittingIndex === index;

              return (
                <Pressable
                  key={`${index}-${option?.text || "option"}`}
                  onPress={() => handleVote(index)}
                  disabled={pollSubmittingIndex !== null}
                  className={`rounded-[20px] border px-4 py-4 ${
                    selected ? "border-amber bg-amber/10" : "border-line bg-white/80"
                  } ${pollSubmittingIndex !== null ? "opacity-80" : ""}`}
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="flex-1 text-[15px] font-semibold text-ink">
                      {option?.text || "Option"}
                    </Text>
                    <Text className="text-[12px] font-bold text-amber">
                      {count} vote{count === 1 ? "" : "s"} · {percentage}%
                    </Text>
                  </View>
                  <Text className="mt-2 font-body text-[13px] leading-5 text-walnut">
                    {isSubmitting ? "Saving your vote..." : selected ? "Selected" : "Tap to vote"}
                  </Text>
                </Pressable>
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
                <Text className="text-[15px] font-semibold text-ink">
                  {reply.author || "Unknown"}
                </Text>
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
                    setActiveReplyTo((current) =>
                      current === String(reply.id) ? "" : String(reply.id)
                    );
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
              onPress={() =>
                loadDetail(Math.max(1, replyMeta.page - 1), {
                  syncStudySubmission: false,
                })
              }
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
              onPress={() =>
                loadDetail(Math.min(replyMeta.totalPages, replyMeta.page + 1), {
                  syncStudySubmission: false,
                })
              }
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

export default CommunityPostDetailScreenClean;
