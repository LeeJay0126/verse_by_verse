import { useEffect, useState, useCallback } from "react";
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

  const fetchCommunity = useCallback(async () => {
    try {
      const res = await apiFetch(`/community/${communityId}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Failed to load community (${res.status})`);
      }

      setCommunity(data.community || null);
    } catch (error) {
      console.error("[PostDetail] fetchCommunity error:", error);
    }
  }, [communityId]);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await apiFetch(`/community/${communityId}/posts/${postId}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load post.");
      }

      setPost(data.post || null);
      setPollResults(data.post?.pollResults || null);
      setMyVotes(data.post?.myVotes || []);
    } catch (error) {
      console.error("[PostDetail] fetchPost error:", error);
      setErr(error.message || "Unable to load this post.");
    } finally {
      setLoading(false);
    }
  }, [communityId, postId]);

  const fetchReplies = useCallback(async () => {
    try {
      setRepliesLoading(true);
      setReplyError("");

      const res = await apiFetch(`/community/${communityId}/posts/${postId}/replies`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load replies.");
      }

      setReplies(data.replies || []);
    } catch (error) {
      console.error("[PostDetail] fetchReplies error:", error);
      setReplyError(error.message || "Unable to load replies.");
    } finally {
      setRepliesLoading(false);
    }
  }, [communityId, postId]);

  useEffect(() => {
    fetchCommunity();
    fetchPost();
    fetchReplies();
  }, [fetchCommunity, fetchPost, fetchReplies]);

  useEffect(() => {
    const onActivity = () => {
      fetchCommunity();
    };

    window.addEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
    return () => window.removeEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
  }, [fetchCommunity]);

  const handleVote = async (optionIndex) => {
    if (!post || post.type !== "poll") return;

    setVoting(true);
    setVoteError("");

    try {
      const res = await apiFetch(`/community/${communityId}/posts/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit vote.");
      }

      setPollResults(data.pollResults || null);
      setMyVotes(data.myVotes || []);
      emitCommunityActivityUpdated();
    } catch (error) {
      console.error("[PostDetail] vote error:", error);
      setVoteError(error.message || "Could not submit your vote.");
    } finally {
      setVoting(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setReplySubmitting(true);
    setReplyError("");

    try {
      const res = await apiFetch(`/community/${communityId}/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to post reply.");
      }

      setReplyBody("");
      await fetchReplies();
      await fetchPost();
      emitCommunityActivityUpdated();
    } catch (error) {
      console.error("[PostDetail] submitReply error:", error);
      setReplyError(error.message || "Unable to post reply.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate(`/community/${communityId}/my-posts`);
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

  const { title, body, type, createdAt, updatedAt, author } = post;

  const typeLabel =
    type === "questions"
      ? "Questions"
      : type === "announcements"
        ? "Announcements"
        : type === "poll"
          ? "Poll"
          : "Bible Study";

  const activityText = Time(updatedAt || createdAt);

  const renderPollSection = () => {
    if (!post.poll || !post.poll.options?.length) {
      return <p className="PostDetailEmptyPoll">This poll doesn’t have any options yet.</p>;
    }

    const counts = pollResults?.counts || [];
    const totalVotes = pollResults?.totalVotes || 0;

    return (
      <div className="PostDetailPoll">
        <h3 className="PostDetailSubTitle">Poll options</h3>

        <ul className="PostDetailPollList">
          {post.poll.options.map((opt, idx) => {
            const count = counts[idx] || 0;
            const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isSelected = myVotes.includes(idx);

            return (
              <li key={idx} className="PostDetailPollOption">
                <button
                  type="button"
                  className={`PostDetailPollButton ${isSelected ? "selected" : ""}`}
                  disabled={voting}
                  onClick={() => handleVote(idx)}
                >
                  <span className="PostDetailPollBar" style={{ width: `${percentage}%` }} />
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
          {post.poll.allowMultiple ? "You can vote for more than one option." : "You can vote for one option."}
          <br />
          {post.poll.anonymous ? "Votes are anonymous." : "Votes may be visible per user."}
        </p>

        {voteError && <p className="communityError smallError">{voteError}</p>}
      </div>
    );
  };


  return (
    <section className="ForumContainer">
      <div className="ForumHero ForumHero--small" style={heroStyle}>
        <PageHeader />
        <div className="ForumHeaderContainer">
          <h1 className="ForumHeader">{community?.header || "Community"}</h1>
          <h2 className="ForumSubHeader">
            <Link to={`/community/${communityId}/my-posts`} className="PostDetailBreadcrumb">
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
          <h2 className="PostDetailSubTitle">Replies ( {post.replyCount ?? replies.length} )</h2>

          {replyError && <p className="communityError smallError">{replyError}</p>}

          {repliesLoading ? (
            <p>Loading replies…</p>
          ) : replies.length === 0 ? (
            <p className="PostDetailRepliesEmpty">No replies yet. Be the first to respond.</p>
          ) : (
            <ol className="PostDetailRepliesList">
              {replies.map((r) => (
                <li key={r.id} className="PostDetailReplyItem">
                  <div className="PostDetailReplyHeader">
                    <span className="PostDetailReplyAuthor">{r.author || "Unknown"}</span>
                    <span className="PostDetailReplyTime">{Time(r.createdAt)}</span>
                  </div>
                  <p className="PostDetailReplyBody">{r.body}</p>
                </li>
              ))}
            </ol>
          )}

          <form className="PostDetailReplyForm" onSubmit={handleSubmitReply}>
            <h2 htmlFor="reply-body" className="PostDetailSubTitle">
              Add a reply
            </h2>
            <textarea
              id="reply-body"
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
