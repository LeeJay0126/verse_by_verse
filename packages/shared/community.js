const normalizeCommunity = (community, options = {}) => {
  const { formatRelativeTime } = options;

  const membersArr = Array.isArray(community?.members) ? community.members : [];
  const membersCount =
    typeof community?.membersCount === "number"
      ? community.membersCount
      : typeof community?.members === "number"
        ? community.members
        : membersArr.length;

  const lastActivityAt =
    community?.lastActivityAt ||
    community?.lastActive ||
    community?.updatedAt ||
    community?.createdAt;

  return {
    ...community,
    id: community?.id || community?._id,
    lastActivityAt,
    lastActive: typeof formatRelativeTime === "function"
      ? formatRelativeTime(lastActivityAt)
      : lastActivityAt,
    membersCount,
    membersList: membersArr,
  };
};

const normalizeCommunityPost = (post, options = {}) => {
  const { formatRelativeTime } = options;
  const activityAt = post?.updatedAt || post?.createdAt || null;

  return {
    ...post,
    id: post?.id || post?._id,
    authorName: post?.author || post?.authorName || "Unknown",
    activityAt,
    activityLabel:
      typeof formatRelativeTime === "function" ? formatRelativeTime(activityAt) : activityAt,
  };
};

const toIdString = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value.id || value._id || value.$oid || "");
  }
  return String(value);
};

const getReplyParentId = (reply) => {
  const parent =
    reply?.parentReplyId ||
    reply?.parentReplyID ||
    reply?.parent_reply_id ||
    reply?.parent_reply ||
    reply?.parentId ||
    reply?.parentID ||
    reply?.parent_id ||
    reply?.parentCommentId ||
    reply?.parent_comment_id ||
    reply?.parentReply ||
    reply?.parent ||
    "";

  return toIdString(parent);
};

const getNestedCommunityReplies = (reply) => {
  if (Array.isArray(reply?.children)) return reply.children;
  if (Array.isArray(reply?.replies)) return reply.replies;
  if (Array.isArray(reply?.childReplies)) return reply.childReplies;
  if (Array.isArray(reply?.child_replies)) return reply.child_replies;
  if (Array.isArray(reply?.nestedReplies)) return reply.nestedReplies;
  if (Array.isArray(reply?.nested_replies)) return reply.nested_replies;
  if (Array.isArray(reply?.subReplies)) return reply.subReplies;
  if (Array.isArray(reply?.sub_replies)) return reply.sub_replies;
  return [];
};

const normalizeCommunityReply = (reply, options = {}) => {
  const { formatRelativeTime } = options;
  const activityAt = reply?.updatedAt || reply?.createdAt || null;

  return {
    ...reply,
    id: toIdString(reply?.id || reply?._id),
    parentReplyId: getReplyParentId(reply),
    activityAt,
    activityLabel:
      typeof formatRelativeTime === "function" ? formatRelativeTime(activityAt) : activityAt,
  };
};

const flattenCommunityReplies = (replies, options = {}, fallbackParentId = "") => {
  const result = [];

  for (const reply of replies || []) {
    const normalized = normalizeCommunityReply(
      fallbackParentId && !getReplyParentId(reply)
        ? { ...reply, parentReplyId: fallbackParentId }
        : reply,
      options
    );
    result.push(normalized);

    const children = getNestedCommunityReplies(reply);
    if (children.length > 0) {
      result.push(...flattenCommunityReplies(children, options, normalized.id));
    }
  }

  return result;
};

const normalizeStudySubmission = (submission) => {
  if (!submission) return null;

  return {
    ...submission,
    id: submission?.id || submission?._id || "",
    reflection: typeof submission?.reflection === "string" ? submission.reflection : "",
    answers: Array.isArray(submission?.answers)
      ? submission.answers.map((item) => String(item ?? ""))
      : [],
    updatedAt: submission?.updatedAt || null,
  };
};

const getJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const createCommunityApi = ({ apiFetch, formatRelativeTime }) => {
  if (typeof apiFetch !== "function") {
    throw new Error("createCommunityApi requires apiFetch");
  }

  const listDiscover = async (params = {}) => {
    const searchParams = new URLSearchParams();
    ["q", "type", "size", "lastActive"].forEach((key) => {
      if (params?.[key]) {
        searchParams.set(key, String(params[key]));
      }
    });

    const query = searchParams.toString();
    const response = await apiFetch(`/community/discover${query ? `?${query}` : ""}`);
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to load communities");
      error.code = data?.code;
      throw error;
    }

    return Array.isArray(data?.communities)
      ? data.communities.map((item) => normalizeCommunity(item, { formatRelativeTime }))
      : [];
  };

  const listMine = async () => {
    const response = await apiFetch("/community/my");
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to load your communities");
      error.code = data?.code;
      throw error;
    }

    return Array.isArray(data?.communities)
      ? data.communities.map((item) => normalizeCommunity(item, { formatRelativeTime }))
      : [];
  };

  const getCommunity = async (communityId) => {
    const response = await apiFetch(`/community/${communityId}`);
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to load community");
      error.code = data?.code;
      throw error;
    }

    return normalizeCommunity(data?.community || {}, { formatRelativeTime });
  };

  const requestJoin = async (communityId) => {
    const response = await apiFetch(`/community/${communityId}/request-join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to request to join");
      error.code = data?.code;
      throw error;
    }

    return data;
  };

  const listPosts = async (communityId, params = {}) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    const response = await apiFetch(`/community/${communityId}/posts${query ? `?${query}` : ""}`);
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to load posts");
      error.code = data?.code;
      throw error;
    }

    return {
      posts: Array.isArray(data?.posts)
        ? data.posts.map((item) => normalizeCommunityPost(item, { formatRelativeTime }))
        : [],
      page: Number(data?.page || params?.page || 1),
      totalPages: Number(data?.totalPages || 1),
      totalCount: Number(data?.totalCount || 0),
      limit: Number(data?.limit || params?.limit || 12),
    };
  };

  const createPost = async (communityId, payload = {}) => {
    const response = await apiFetch(`/community/${communityId}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to create post");
      error.code = data?.code;
      throw error;
    }

    return {
      ...data,
      postId: data?.postId ? String(data.postId) : "",
    };
  };

  const getPostDetail = async (communityId, postId) => {
    const response = await apiFetch(`/community/${communityId}/posts/${postId}`);
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to load post");
      error.code = data?.code;
      throw error;
    }

    return {
      community: normalizeCommunity(data?.community || {}, { formatRelativeTime }),
      post: normalizeCommunityPost(data?.post || {}, { formatRelativeTime }),
    };
  };

  const listReplies = async (communityId, postId, params = {}) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    const response = await apiFetch(
      `/community/${communityId}/posts/${postId}/replies${query ? `?${query}` : ""}`
    );
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to load replies");
      error.code = data?.code;
      throw error;
    }

    return {
      replies: Array.isArray(data?.replies)
        ? flattenCommunityReplies(data.replies, { formatRelativeTime })
        : [],
      myUserId: data?.myUserId ? String(data.myUserId) : "",
      page: Number(data?.page || params?.page || 1),
      totalPages: Number(data?.totalPages || 1),
      totalRootReplies: Number(data?.totalRootReplies || 0),
      limit: Number(data?.limit || params?.limit || 8),
    };
  };

  const createReply = async (communityId, postId, payload = {}) => {
    const response = await apiFetch(`/community/${communityId}/posts/${postId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to post reply");
      error.code = data?.code;
      throw error;
    }

    return {
      ...data,
      reply: data?.reply ? normalizeCommunityReply(data.reply, { formatRelativeTime }) : null,
    };
  };

  const updateReply = async (communityId, postId, replyId, payload = {}) => {
    const response = await apiFetch(`/community/${communityId}/posts/${postId}/replies/${replyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to update reply");
      error.code = data?.code;
      throw error;
    }

    return {
      ...data,
      reply: data?.reply ? normalizeCommunityReply(data.reply, { formatRelativeTime }) : null,
    };
  };

  const deleteReply = async (communityId, postId, replyId) => {
    const response = await apiFetch(`/community/${communityId}/posts/${postId}/replies/${replyId}`, {
      method: "DELETE",
    });
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to delete reply");
      error.code = data?.code;
      throw error;
    }

    return data;
  };

  const voteOnPoll = async (communityId, postId, optionIndex) => {
    const response = await apiFetch(`/community/${communityId}/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIndex }),
    });
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to save poll vote");
      error.code = data?.code;
      throw error;
    }

    return {
      ...data,
      myVotes: Array.isArray(data?.myVotes) ? data.myVotes.map((item) => Number(item)) : [],
      pollResults: {
        counts: Array.isArray(data?.pollResults?.counts) ? data.pollResults.counts : [],
        totalVotes: Number(data?.pollResults?.totalVotes || 0),
      },
    };
  };

  const getStudySubmissionMe = async (communityId, postId) => {
    const response = await apiFetch(`/community/${communityId}/posts/${postId}/study-submissions/me`);
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to load your Bible study response");
      error.code = data?.code;
      throw error;
    }

    return normalizeStudySubmission(data?.submission);
  };

  const saveStudySubmission = async (communityId, postId, payload = {}) => {
    const response = await apiFetch(`/community/${communityId}/posts/${postId}/study-submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reflection: payload?.reflection || "",
        answers: Array.isArray(payload?.answers) ? payload.answers : [],
      }),
    });
    const data = await getJsonSafely(response);

    if (!response.ok || data?.ok === false) {
      const error = new Error(data?.error || "Unable to share your Bible study response");
      error.code = data?.code;
      throw error;
    }

    return {
      ...data,
      submission: normalizeStudySubmission(data?.submission),
      reply: data?.reply ? normalizeCommunityReply(data.reply, { formatRelativeTime }) : null,
    };
  };

  return {
    listDiscover,
    listMine,
    getCommunity,
    requestJoin,
    listPosts,
    createPost,
    getPostDetail,
    listReplies,
    createReply,
    updateReply,
    deleteReply,
    voteOnPoll,
    getStudySubmissionMe,
    saveStudySubmission,
  };
};

module.exports = {
  normalizeCommunity,
  normalizeCommunityPost,
  normalizeCommunityReply,
  normalizeStudySubmission,
  createCommunityApi,
};
