import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../../../../../component/utils/ApiFetch";
import { emitCommunityActivityUpdated } from "../../../../../component/utils/CommunityEvents";

const ROOT_REPLIES_PER_PAGE = 8;

const isInViewport = (el) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return r.top >= 0 && r.bottom <= vh;
};

const usePostReplies = ({ communityId, postId, post, onPostChanged }) => {
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(true);
  const [replyError, setReplyError] = useState("");
  const [replyMeta, setReplyMeta] = useState({
    page: 1,
    totalPages: 1,
    totalRootReplies: 0,
    limit: ROOT_REPLIES_PER_PAGE,
  });

  const [replyBody, setReplyBody] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const [activeReplyTo, setActiveReplyTo] = useState(null);
  const [childBody, setChildBody] = useState("");

  const [myUserId, setMyUserId] = useState(null);

  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const editBoxRef = useRef(null);
  const replyBoxRef = useRef(null);
  const childReplyBoxRef = useRef(null);

  const scrollYRef = useRef(0);
  const restoreScrollRef = useRef(false);
  const lastCreatedReplyIdRef = useRef(null);

  const fetchReplies = useCallback(
    async ({ page = replyMeta.page, keepLoader = false } = {}) => {
      try {
        if (!keepLoader) setRepliesLoading(true);
        setReplyError("");

        const params = new URLSearchParams({
          page: String(page),
          limit: String(ROOT_REPLIES_PER_PAGE),
        });

        const res = await apiFetch(`/community/${communityId}/posts/${postId}/replies?${params.toString()}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load replies.");
        }

        setReplies(Array.isArray(data.replies) ? data.replies : []);
        setMyUserId(data.myUserId ? String(data.myUserId) : null);
        setReplyMeta({
          page: Number(data.page || page || 1),
          totalPages: Math.max(1, Number(data.totalPages || 1)),
          totalRootReplies: Number(data.totalRootReplies || 0),
          limit: Number(data.limit || ROOT_REPLIES_PER_PAGE),
        });
      } catch (error) {
        setReplyError(error.message || "Unable to load replies.");
      } finally {
        if (!keepLoader) setRepliesLoading(false);
      }
    },
    [communityId, postId, replyMeta.page]
  );

  useEffect(() => {
    fetchReplies({ page: replyMeta.page });
  }, [fetchReplies, replyMeta.page]);

  useEffect(() => {
    if (!restoreScrollRef.current) return;
    window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "auto" });
    restoreScrollRef.current = false;
  }, [replies]);

  useEffect(() => {
    const newId = lastCreatedReplyIdRef.current;
    if (!newId) return;

    const el = document.getElementById(`reply-${newId}`);
    if (el) {
      if (!isInViewport(el)) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      el.classList.add("is-new-highlight");
      window.setTimeout(() => el.classList.remove("is-new-highlight"), 1600);
    }

    lastCreatedReplyIdRef.current = null;
  }, [replies]);

  useEffect(() => {
    if (!editingReplyId) return;
    requestAnimationFrame(() => editBoxRef.current?.focus());
  }, [editingReplyId]);

  const refreshAfterMutation = useCallback(
    async (preferredPage = replyMeta.page) => {
      await fetchReplies({ page: preferredPage });
      if (onPostChanged) await onPostChanged({ showLoader: false });
      emitCommunityActivityUpdated();
    },
    [fetchReplies, onPostChanged, replyMeta.page]
  );

  const handleSubmitReply = useCallback(
    async (e) => {
      e.preventDefault();
      if (!replyBody.trim()) return;

      scrollYRef.current = window.scrollY;
      restoreScrollRef.current = true;

      setReplySubmitting(true);
      setReplyError("");

      try {
        const res = await apiFetch(`/community/${communityId}/posts/${postId}/replies`, {
          method: "POST",
          body: JSON.stringify({ body: replyBody }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to post reply.");
        }

        lastCreatedReplyIdRef.current = data.reply?.id ? String(data.reply.id) : null;
        setReplyBody("");
        setActiveReplyTo(null);
        requestAnimationFrame(() => replyBoxRef.current?.focus());

        setReplyMeta((prev) => ({ ...prev, page: 1 }));
        await refreshAfterMutation(1);
      } catch (error) {
        setReplyError(error.message || "Unable to post reply.");
      } finally {
        setReplySubmitting(false);
      }
    },
    [communityId, postId, replyBody, refreshAfterMutation]
  );

  const handleSubmitChildReply = useCallback(
    async (e) => {
      e.preventDefault();
      if (!childBody.trim() || !activeReplyTo) return;

      scrollYRef.current = window.scrollY;
      restoreScrollRef.current = true;

      setReplySubmitting(true);
      setReplyError("");

      try {
        const res = await apiFetch(`/community/${communityId}/posts/${postId}/replies`, {
          method: "POST",
          body: JSON.stringify({ body: childBody, parentReplyId: activeReplyTo }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to post reply.");
        }

        lastCreatedReplyIdRef.current = data.reply?.id ? String(data.reply.id) : null;
        setChildBody("");
        setActiveReplyTo(null);
        requestAnimationFrame(() => replyBoxRef.current?.focus());

        await refreshAfterMutation(replyMeta.page);
      } catch (error) {
        setReplyError(error.message || "Unable to post reply.");
      } finally {
        setReplySubmitting(false);
      }
    },
    [communityId, postId, childBody, activeReplyTo, refreshAfterMutation, replyMeta.page]
  );

  const startEditReply = useCallback((reply) => {
    if (reply?.replyType === "study_share") return;
    setEditingReplyId(String(reply.id));
    setEditBody(reply.body || "");
    setActiveReplyTo(null);
  }, []);

  const cancelEditReply = useCallback(() => {
    setEditingReplyId(null);
    setEditBody("");
  }, []);

  const handleSaveEdit = useCallback(
    async (replyId) => {
      const trimmed = (editBody || "").trim();
      if (!trimmed) return;

      scrollYRef.current = window.scrollY;
      restoreScrollRef.current = true;

      setEditSubmitting(true);
      setReplyError("");

      try {
        const res = await apiFetch(`/community/${communityId}/posts/${postId}/replies/${replyId}`, {
          method: "PUT",
          body: JSON.stringify({ body: trimmed }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to update reply.");
        }

        const updated = data.reply;

        setReplies((prev) =>
          prev.map((item) =>
            String(item.id) === String(replyId)
              ? {
                  ...item,
                  body: updated?.body ?? item.body,
                  updatedAt: updated?.updatedAt ?? item.updatedAt,
                }
              : item
          )
        );

        setEditingReplyId(null);
        setEditBody("");

        if (onPostChanged) await onPostChanged({ showLoader: false });
        emitCommunityActivityUpdated();
      } catch (error) {
        setReplyError(error.message || "Unable to update reply.");
      } finally {
        setEditSubmitting(false);
      }
    },
    [communityId, postId, editBody, onPostChanged]
  );

  const handleDeleteReply = useCallback(
    async (replyId) => {
      const ok = window.confirm("Delete this reply? This will also delete any replies under it.");
      if (!ok) return;

      scrollYRef.current = window.scrollY;
      restoreScrollRef.current = true;

      setReplySubmitting(true);
      setReplyError("");

      try {
        const res = await apiFetch(`/community/${communityId}/posts/${postId}/replies/${replyId}`, {
          method: "DELETE",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to delete reply.");
        }

        if (editingReplyId === String(replyId)) cancelEditReply();
        if (activeReplyTo === String(replyId)) {
          setActiveReplyTo(null);
          setChildBody("");
        }

        const nextTotal = Math.max(0, replyMeta.totalRootReplies - Number(data.deletedRootCount || 0));
        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / ROOT_REPLIES_PER_PAGE));
        const nextPage = Math.min(replyMeta.page, nextTotalPages);

        setReplyMeta((prev) => ({ ...prev, page: nextPage }));
        await refreshAfterMutation(nextPage);
      } catch (error) {
        setReplyError(error.message || "Unable to delete reply.");
      } finally {
        setReplySubmitting(false);
      }
    },
    [
      activeReplyTo,
      cancelEditReply,
      communityId,
      editingReplyId,
      postId,
      refreshAfterMutation,
      replyMeta.page,
      replyMeta.totalRootReplies,
    ]
  );

  const pageInfoText = useMemo(() => {
    if (!replyMeta.totalRootReplies) return "";
    const start = (replyMeta.page - 1) * replyMeta.limit + 1;
    const end = Math.min(replyMeta.page * replyMeta.limit, replyMeta.totalRootReplies);
    return { start, end };
  }, [replyMeta]);

  return {
    replies,
    myUserId,
    repliesLoading,
    replyError,
    replySubmitting,
    replyBody,
    setReplyBody,
    activeReplyTo,
    setActiveReplyTo,
    childBody,
    setChildBody,
    editingReplyId,
    editBody,
    setEditBody,
    editSubmitting,
    startEditReply,
    cancelEditReply,
    handleSaveEdit,
    handleDeleteReply,
    handleSubmitReply,
    handleSubmitChildReply,
    replyBoxRef,
    childReplyBoxRef,
    editBoxRef,
    replyMeta,
    setReplyPage: (nextPage) => setReplyMeta((prev) => ({ ...prev, page: nextPage })),
    pageInfoText,
    refetchReplies: fetchReplies,
  };
};

export default usePostReplies;
