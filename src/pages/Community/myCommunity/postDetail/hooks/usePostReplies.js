import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../../../../../component/utils/ApiFetch";
import { emitCommunityActivityUpdated } from "../../../../../component/utils/CommunityEvents";

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

  const fetchReplies = useCallback(async () => {
    try {
      setRepliesLoading(true);
      setReplyError("");
      const res = await apiFetch(`/community/${communityId}/posts/${postId}/replies`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Failed to load replies.");

      setReplies(Array.isArray(data.replies) ? data.replies : []);
      setMyUserId(data.myUserId ? String(data.myUserId) : null);
    } catch (error) {
      setReplyError(error.message || "Unable to load replies.");
    } finally {
      setRepliesLoading(false);
    }
  }, [communityId, postId]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

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
      if (!isInViewport(el)) {}
      el.classList.add("is-new-highlight");
      window.setTimeout(() => el.classList.remove("is-new-highlight"), 1600);
    }

    lastCreatedReplyIdRef.current = null;
  }, [replies]);

  useEffect(() => {
    if (!editingReplyId) return;
    requestAnimationFrame(() => editBoxRef.current?.focus());
  }, [editingReplyId]);

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: replyBody }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok)
          throw new Error(data.error || "Failed to post reply.");

        lastCreatedReplyIdRef.current = data.reply?.id ? String(data.reply.id) : null;

        setReplyBody("");
        requestAnimationFrame(() => replyBoxRef.current?.focus());

        await fetchReplies();
        if (onPostChanged) await onPostChanged({ showLoader: false });
        emitCommunityActivityUpdated();
      } catch (error) {
        setReplyError(error.message || "Unable to post reply.");
      } finally {
        setReplySubmitting(false);
      }
    },
    [communityId, postId, replyBody, fetchReplies, onPostChanged]
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: childBody, parentReplyId: activeReplyTo }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok)
          throw new Error(data.error || "Failed to post reply.");

        lastCreatedReplyIdRef.current = data.reply?.id ? String(data.reply.id) : null;

        setChildBody("");
        setActiveReplyTo(null);
        requestAnimationFrame(() => replyBoxRef.current?.focus());

        await fetchReplies();
        if (onPostChanged) await onPostChanged({ showLoader: false });
        emitCommunityActivityUpdated();
      } catch (error) {
        setReplyError(error.message || "Unable to post reply.");
      } finally {
        setReplySubmitting(false);
      }
    },
    [communityId, postId, childBody, activeReplyTo, fetchReplies, onPostChanged]
  );

  const startEditReply = useCallback((r) => {
    setEditingReplyId(String(r.id));
    setEditBody(r.body || "");
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
        const res = await apiFetch(
          `/community/${communityId}/posts/${postId}/replies/${replyId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body: trimmed }),
          }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok)
          throw new Error(data.error || "Failed to update reply.");

        const updated = data.reply;

        setReplies((prev) =>
          prev.map((x) =>
            String(x.id) === String(replyId)
              ? {
                  ...x,
                  body: updated?.body ?? x.body,
                  updatedAt: updated?.updatedAt ?? x.updatedAt,
                }
              : x
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
      const ok = window.confirm(
        "Delete this reply? This will also delete any replies under it."
      );
      if (!ok) return;

      scrollYRef.current = window.scrollY;
      restoreScrollRef.current = true;

      setReplySubmitting(true);
      setReplyError("");

      try {
        const res = await apiFetch(
          `/community/${communityId}/posts/${postId}/replies/${replyId}`,
          { method: "DELETE" }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok)
          throw new Error(data.error || "Failed to delete reply.");

        if (editingReplyId === String(replyId)) cancelEditReply();
        if (activeReplyTo === String(replyId)) {
          setActiveReplyTo(null);
          setChildBody("");
        }

        await fetchReplies();
        if (onPostChanged) await onPostChanged({ showLoader: false });
        emitCommunityActivityUpdated();
      } catch (error) {
        setReplyError(error.message || "Unable to delete reply.");
      } finally {
        setReplySubmitting(false);
      }
    },
    [
      communityId,
      postId,
      fetchReplies,
      onPostChanged,
      editingReplyId,
      activeReplyTo,
      cancelEditReply,
    ]
  );

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
  };
};

export default usePostReplies;
