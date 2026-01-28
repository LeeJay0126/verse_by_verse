import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import Time from "../../../component/utils/Time";
import "./MyCommunity.css";
import "./PostDetail.css";
import { apiFetch } from "../../../component/utils/ApiFetch";
import {
  COMMUNITY_ACTIVITY_EVENT,
  emitCommunityActivityUpdated,
} from "../../../component/utils/CommunityEvents";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
const DEFAULT_HERO = "/community/CommunityDefaultHero.png";

const MAX_DEPTH = 12;
const VISUAL_MAX_DEPTH = 6;
const MAX_REPLY_DEPTH = 2;
const MAX_CHILDREN_RENDER = 4;

const isInViewport = (el) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return r.top >= 0 && r.bottom <= vh;
};

const PostDetail = () => {
  const { communityId, postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [pollResults, setPollResults] = useState(null);
  const [myVotes, setMyVotes] = useState([]);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState("");

  const [replies, setReplies] = useState([]);
  const [replyBody, setReplyBody] = useState("");
  const [repliesLoading, setRepliesLoading] = useState(true);
  const [replyError, setReplyError] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const [expanded, setExpanded] = useState(() => new Set());
  const [activeReplyTo, setActiveReplyTo] = useState(null);
  const [childBody, setChildBody] = useState("");

  const [deepExpanded, setDeepExpanded] = useState(() => new Set());

  const [myUserId, setMyUserId] = useState(null);

  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const editBoxRef = useRef(null);

  const scrollYRef = useRef(0);
  const restoreScrollRef = useRef(false);
  const replyBoxRef = useRef(null);
  const childReplyBoxRef = useRef(null);
  const lastCreatedReplyIdRef = useRef(null);

  const fetchCommunity = useCallback(async () => {
    try {
      const res = await apiFetch(`/community/${communityId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) return;
      setCommunity(data.community || null);
    } catch { }
  }, [communityId]);

  const fetchPost = useCallback(
    async ({ showLoader = false } = {}) => {
      try {
        if (showLoader) setLoading(true);
        setErr("");
        const res = await apiFetch(
          `/community/${communityId}/posts/${postId}`
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok)
          throw new Error(data.error || "Failed to load post.");
        setPost(data.post || null);
        setPollResults(data.post?.pollResults || null);
        setMyVotes(data.post?.myVotes || []);
        setCommunity((prev) => data.community || prev || null);
      } catch (error) {
        setErr(error.message || "Unable to load this post.");
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [communityId, postId]
  );

  const fetchReplies = useCallback(async () => {
    try {
      setRepliesLoading(true);
      setReplyError("");
      const res = await apiFetch(
        `/community/${communityId}/posts/${postId}/replies`
      );
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
    fetchCommunity();
    fetchPost({ showLoader: true });
    fetchReplies();
  }, [fetchCommunity, fetchPost, fetchReplies]);

  useEffect(() => {
    const onActivity = () => fetchCommunity();
    window.addEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
    return () =>
      window.removeEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
  }, [fetchCommunity]);

  const replyTree = useMemo(() => {
    const byParent = new Map();
    const byId = new Map();

    for (const r of replies) {
      byId.set(String(r.id), r);
      const parentKey = r.parentReplyId ? String(r.parentReplyId) : "root";
      if (!byParent.has(parentKey)) byParent.set(parentKey, []);
      byParent.get(parentKey).push(r);
    }

    const statsCache = new Map();

    const getStats = (id) => {
      if (statsCache.has(id)) return statsCache.get(id);

      const self = byId.get(id);
      const children = byParent.get(id) || [];

      let count = children.length;
      let latest = self?.createdAt ? new Date(self.createdAt) : new Date(0);

      for (const c of children) {
        const s = getStats(String(c.id));
        count += s.count;
        if (s.latest > latest) latest = s.latest;
      }

      const result = { count, latest };
      statsCache.set(id, result);
      return result;
    };

    const sortFn = (a, b) => {
      const sa = getStats(String(a.id));
      const sb = getStats(String(b.id));
      if (sb.count !== sa.count) return sb.count - sa.count;
      return sb.latest - sa.latest;
    };

    for (const [, arr] of byParent.entries()) {
      arr.sort(sortFn);
    }

    return { byParent };
  }, [replies]);

  const toggleExpanded = (replyId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      const key = String(replyId);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleDeepExpanded = (replyId) => {
    setDeepExpanded((prev) => {
      const next = new Set(prev);
      const key = String(replyId);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
      if (!isInViewport(el)) { }
      el.classList.add("is-new-highlight");
      window.setTimeout(() => el.classList.remove("is-new-highlight"), 1600);
    }

    lastCreatedReplyIdRef.current = null;
  }, [replies]);

  useEffect(() => {
    if (!editingReplyId) return;
    requestAnimationFrame(() => editBoxRef.current?.focus());
  }, [editingReplyId]);

  const handleVoteToggle = async (optionIndex) => {
    if (!post || post.type !== "poll") return;
    if (voting) return;

    setVoting(true);
    setVoteError("");

    try {
      const res = await apiFetch(
        `/community/${communityId}/posts/${post.id}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionIndex }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Failed to update vote.");

      setPollResults(data.pollResults || null);
      setMyVotes(Array.isArray(data.myVotes) ? data.myVotes : []);
      emitCommunityActivityUpdated();
    } catch (error) {
      setVoteError(error.message || "Could not update your vote.");
    } finally {
      setVoting(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    scrollYRef.current = window.scrollY;
    restoreScrollRef.current = true;

    setReplySubmitting(true);
    setReplyError("");

    try {
      const res = await apiFetch(
        `/community/${communityId}/posts/${postId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: replyBody }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Failed to post reply.");

      lastCreatedReplyIdRef.current = data.reply?.id
        ? String(data.reply.id)
        : null;

      setReplyBody("");
      requestAnimationFrame(() => replyBoxRef.current?.focus());

      await fetchReplies();
      await fetchPost({ showLoader: false });
      emitCommunityActivityUpdated();
    } catch (error) {
      setReplyError(error.message || "Unable to post reply.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleSubmitChildReply = async (e) => {
    e.preventDefault();
    if (!childBody.trim() || !activeReplyTo) return;

    scrollYRef.current = window.scrollY;
    restoreScrollRef.current = true;

    setReplySubmitting(true);
    setReplyError("");

    try {
      const res = await apiFetch(
        `/community/${communityId}/posts/${postId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: childBody, parentReplyId: activeReplyTo }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Failed to post reply.");

      lastCreatedReplyIdRef.current = data.reply?.id
        ? String(data.reply.id)
        : null;

      setChildBody("");
      setActiveReplyTo(null);

      setExpanded((prev) => {
        const next = new Set(prev);
        next.add(String(activeReplyTo));
        return next;
      });

      requestAnimationFrame(() => replyBoxRef.current?.focus());

      await fetchReplies();
      await fetchPost({ showLoader: false });
      emitCommunityActivityUpdated();
    } catch (error) {
      setReplyError(error.message || "Unable to post reply.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const startEditReply = (r) => {
    setEditingReplyId(String(r.id));
    setEditBody(r.body || "");
    setActiveReplyTo(null);
  };

  const cancelEditReply = () => {
    setEditingReplyId(null);
    setEditBody("");
  };

  const handleSaveEdit = async (replyId) => {
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

      await fetchPost({ showLoader: false });
      emitCommunityActivityUpdated();
    } catch (error) {
      setReplyError(error.message || "Unable to update reply.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
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
      await fetchPost({ showLoader: false });
      emitCommunityActivityUpdated();
    } catch (error) {
      setReplyError(error.message || "Unable to delete reply.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const heroBackgroundUrl = community?.heroImageUrl
    ? `${API_BASE}${community.heroImageUrl}`
    : DEFAULT_HERO;
  const heroStyle = {
    backgroundImage: `url("${heroBackgroundUrl}")`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  };

  const handleBackClick = () => navigate(`/community/${communityId}/my-posts`);

  if (loading) {
    return (
      <section className="ForumContainer">
        <div className="ForumHero ForumHero--small" style={heroStyle}>
          <PageHeader />
        </div>
        <section className="ForumBody">
          <p>Loading post…</p>
        </section>
        <Footer />
      </section>
    );
  }

  if (err || !post) {
    return (
      <section className="ForumContainer">
        <div className="ForumHero ForumHero--small" style={heroStyle}>
          <PageHeader />
        </div>
        <section className="ForumBody">
          <p className="communityError">{err || "Post not found."}</p>
          <button className="NewPostSecondaryButton" onClick={handleBackClick}>
            Back to community
          </button>
        </section>
        <Footer />
      </section>
    );
  }

  const { title, body, type, createdAt, updatedAt, author, poll } = post;
  const typeLabel =
    type === "questions"
      ? "Questions"
      : type === "announcements"
        ? "Announcements"
        : type === "poll"
          ? "📊 Poll"
          : "Bible Study";
  const activityText = Time(updatedAt || createdAt);

  const renderPollSection = () => {
    if (!poll || !poll.options?.length)
      return (
        <p className="PostDetailEmptyPoll">
          This poll doesn’t have any options yet.
        </p>
      );

    const counts = pollResults?.counts || [];
    const totalVotes = pollResults?.totalVotes || 0;

    return (
      <div className="PostDetailPoll">
        <h3 className="PostDetailSubTitle">Poll options</h3>

        <ul className="PostDetailPollList">
          {poll.options.map((opt, idx) => {
            const count = counts[idx] || 0;
            const percentage =
              totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isSelected = myVotes.includes(idx);

            return (
              <li key={idx} className="PostDetailPollOption">
                <button
                  type="button"
                  className={`PostDetailPollButton ${isSelected ? "selected" : ""
                    }`}
                  disabled={voting}
                  onClick={() => handleVoteToggle(idx)}
                  aria-pressed={isSelected}
                >
                  <span
                    className="PostDetailPollBar"
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="PostDetailPollContent">
                    <span className="PostDetailPollLabel">{opt.text}</span>
                    <span className="PostDetailPollStats">
                      {count} vote{count === 1 ? "" : "s"} ({percentage}%)
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="PostDetailPollMeta">
          {poll.allowMultiple
            ? "You can vote for more than one option."
            : "You can vote for one option."}
          <br />
          {poll.anonymous ? "Votes are anonymous." : "Votes may be visible per user."}
        </p>

        {voteError && <p className="communityError smallError">{voteError}</p>}
      </div>
    );
  };

  const renderReplyNode = (r, depth, ancestorHasNext = [], isLast = true) => {
    const id = String(r.id);
    const children = replyTree.byParent.get(id) || [];
    const isExpanded = expanded.has(id);

    const clampedDepth = Math.min(depth, MAX_DEPTH);
    const visualDepth = Math.min(clampedDepth, VISUAL_MAX_DEPTH);

    const canReplyHere = clampedDepth < MAX_REPLY_DEPTH;

    const isTooDeep = clampedDepth >= VISUAL_MAX_DEPTH;
    const isDeepOpen = deepExpanded.has(id);

    const hasNextSibling = !isLast;
    const elbowContinue = hasNextSibling;

    const cols = [];
    if (visualDepth > 0) {
      const ancestorColsCount = visualDepth - 1;

      for (let i = 0; i < ancestorColsCount; i++) {
        cols.push(
          <span
            key={`col-${id}-${i}`}
            className={`ThreadCol ${ancestorHasNext[i] ? "on" : "off"}`}
            style={{ "--i": i }}
            aria-hidden="true"
          />
        );
      }

      cols.push(
        <span
          key={`elbow-${id}`}
          className={`ThreadElbow ${elbowContinue ? "continue" : "stop"}`}
          style={{ "--i": visualDepth - 1 }}
          aria-hidden="true"
        />
      );
    }

    const showChildren =
      isExpanded && children.length > 0 && (!isTooDeep || isDeepOpen);
    const visibleChildren = children.slice(0, MAX_CHILDREN_RENDER);

    const isOwner = myUserId && r.authorId && String(r.authorId) === String(myUserId);
    const isEditing = editingReplyId === id;

    return (
      <li
        key={id}
        id={`reply-${id}`}
        className="PostDetailReplyItem"
        style={{ "--depth": visualDepth }}
      >
        <div className="ThreadRow">
          <div className="ThreadGutter" aria-hidden="true">
            {cols}
          </div>

          <div className="ThreadContent">
            <div className="PostDetailReplyHeader">
              <div className="PostDetailReplyHeaderLeft">
                <span className="PostDetailReplyAuthor">
                  {r.author || "Unknown"}
                </span>
                {clampedDepth > visualDepth && (
                  <span className="ThreadDepthCapDot" aria-hidden="true" />
                )}
              </div>
              <span className="PostDetailReplyTime">
                {Time(r.updatedAt || r.createdAt)}
                {r.updatedAt ? " (edited)" : ""}
              </span>
            </div>

            {!isEditing ? (
              <p className="PostDetailReplyBody">{r.body}</p>
            ) : (
              <form
                className="PostDetailInlineEditForm"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEdit(id);
                }}
              >
                <textarea
                  ref={editBoxRef}
                  rows={2}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  disabled={editSubmitting}
                  className="replyInputBox"
                />
                <div className="PostDetailInlineReplyActions">
                  <button
                    type="button"
                    className="NewPostSecondaryButton"
                    onClick={cancelEditReply}
                    disabled={editSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="NewPostPrimaryButton"
                    disabled={editSubmitting || !editBody.trim()}
                  >
                    {editSubmitting ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            )}

            <div className="PostDetailReplyActionsRow">
              <div className="replyActionsRowLeft">
                {!isEditing && canReplyHere ? (
                  <button
                    type="button"
                    className="ReplyActionBtn"
                    onClick={() => {
                      setActiveReplyTo(id);
                      setChildBody("");
                      setExpanded((prev) => {
                        const next = new Set(prev);
                        next.add(id);
                        return next;
                      });
                      requestAnimationFrame(() => childReplyBoxRef.current?.focus());
                    }}
                    disabled={replySubmitting || editSubmitting}
                  >
                    Reply
                  </button>
                ) : !isEditing ? (
                  <span className="ReplyDepthLimitText">
                    Reply depth limit reached
                  </span>
                ) : null}

                {children.length > 0 && (
                  <button
                    type="button"
                    className="ReplyActionBtn"
                    onClick={() => toggleExpanded(id)}
                    disabled={replySubmitting || editSubmitting}
                  >
                    {isExpanded ? "Hide replies" : `View replies (${children.length})`}
                  </button>
                )}
              </div>
              <div className="replyActionRowFlexRight">
                {!isEditing && isOwner && (
                  <>
                    <button
                      type="button"
                      className="ReplyActionBtn ReplyActionBtn--muted"
                      onClick={() => startEditReply(r)}
                      disabled={replySubmitting || editSubmitting}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ReplyActionBtn ReplyActionBtn--danger"
                      onClick={() => handleDeleteReply(id)}
                      disabled={replySubmitting || editSubmitting}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
              {isExpanded && children.length > 0 && isTooDeep && !isDeepOpen && (
                <button
                  type="button"
                  className="ReplyActionBtn ReplyActionBtn--deep"
                  onClick={() => toggleDeepExpanded(id)}
                  disabled={replySubmitting || editSubmitting}
                >
                  Continue this thread
                </button>
              )}

              {isExpanded && children.length > 0 && isTooDeep && isDeepOpen && (
                <button
                  type="button"
                  className="ReplyActionBtn ReplyActionBtn--deep"
                  onClick={() => toggleDeepExpanded(id)}
                  disabled={replySubmitting || editSubmitting}
                >
                  Collapse deep thread
                </button>
              )}
            </div>

            {activeReplyTo === id && canReplyHere && !isEditing && (
              <form
                className="PostDetailInlineReplyForm"
                onSubmit={handleSubmitChildReply}
              >
                <textarea
                  ref={childReplyBoxRef}
                  rows={2}
                  value={childBody}
                  onChange={(e) => setChildBody(e.target.value)}
                  placeholder="Write a reply…"
                  disabled={replySubmitting}
                  className="replyInputBox"
                />
                <div className="PostDetailInlineReplyActions">
                  <button
                    type="button"
                    className="NewPostSecondaryButton"
                    onClick={() => {
                      setActiveReplyTo(null);
                      setChildBody("");
                    }}
                    disabled={replySubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="NewPostPrimaryButton"
                    disabled={replySubmitting || !childBody.trim()}
                  >
                    {replySubmitting ? "Posting…" : "Post"}
                  </button>
                </div>
              </form>
            )}

            {isExpanded && children.length > 0 && isTooDeep && !isDeepOpen && (
              <div className="DeepThreadPreview">
                <button
                  type="button"
                  className="DeepThreadBtn"
                  onClick={() => toggleDeepExpanded(id)}
                  disabled={replySubmitting || editSubmitting}
                >
                  Continue this thread ({children.length})
                </button>
              </div>
            )}

            {showChildren && (
              <ol className="PostDetailRepliesChildren">
                {visibleChildren.map((c, idx) => {
                  const childIsLast = idx === visibleChildren.length - 1;
                  const nextAncestorHasNext = [
                    ...ancestorHasNext.slice(0, Math.max(0, visualDepth - 1)),
                    hasNextSibling,
                  ];
                  return renderReplyNode(
                    c,
                    clampedDepth + 1,
                    nextAncestorHasNext,
                    childIsLast
                  );
                })}

                {children.length > MAX_CHILDREN_RENDER && (
                  <li className="PostDetailRepliesMore">
                    <span className="PostDetailRepliesMoreText">
                      Showing {MAX_CHILDREN_RENDER} of {children.length} replies
                    </span>
                  </li>
                )}
              </ol>
            )}
          </div>
        </div>
      </li>
    );
  };

  const rootReplies = replyTree.byParent.get("root") || [];

  return (
    <section className="ForumContainer">
      <div className="ForumHero ForumHero--small" style={heroStyle}>
        <PageHeader />
        <div className="ForumHeaderContainer">
          <h1 className="ForumHeader">{community?.header || "Community"}</h1>
          <h2 className="ForumSubHeader">
            <Link
              to={`/community/${communityId}/my-posts`}
              className="PostDetailBreadcrumb"
            >
              Back to posts
            </Link>
          </h2>
        </div>
      </div>

      <section className="ForumBody PostDetailBody">
        <header className="PostDetailHeader">
          <div className="PostDetailMetaRow">
            <span className={`Tag ${type || "general"}`}>
              {type === "poll" ? "📊 Poll" : typeLabel}
            </span>
            <span className="PostDetailMetaText">
              Posted by {author || "Unknown"} · {activityText}
            </span>
          </div>

          <h1 className="PostDetailTitle">{title}</h1>

          {body && (
            <article className="PostDetailContent">
              <p>{body}</p>
            </article>
          )}
        </header>

        {type === "poll" && renderPollSection()}

        <section className="PostDetailReplies">
          <h2 className="PostDetailSubTitle">
            Replies ( {post.replyCount ?? replies.length} )
          </h2>

          {replyError && <p className="communityError smallError">{replyError}</p>}

          {repliesLoading ? (
            <p>Loading replies…</p>
          ) : rootReplies.length === 0 ? (
            <p className="PostDetailRepliesEmpty">
              No replies yet. Be the first to respond.
            </p>
          ) : (
            <ol className="PostDetailRepliesList">
              {rootReplies.map((r, idx) =>
                renderReplyNode(r, 0, [], idx === rootReplies.length - 1)
              )}
            </ol>
          )}

          <form className="PostDetailReplyForm" onSubmit={handleSubmitReply}>
            <h2 className="PostDetailSubTitle">Add a reply</h2>
            <textarea
              ref={replyBoxRef}
              rows={3}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Share your thoughts or encouragement…"
              disabled={replySubmitting}
              className="replyInputBox"
            />
            <button
              type="submit"
              className="NewPostPrimaryButton"
              disabled={replySubmitting || !replyBody.trim()}
            >
              {replySubmitting ? "Posting…" : "Post reply"}
            </button>
          </form>
        </section>
      </section>

      <Footer />
    </section>
  );
};

export default PostDetail;
