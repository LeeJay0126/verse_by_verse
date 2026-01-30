import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../../../../component/utils/ApiFetch";
import {
  COMMUNITY_ACTIVITY_EVENT,
  emitCommunityActivityUpdated,
} from "../../../../../component/utils/CommunityEvents";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
const DEFAULT_HERO = "/community/CommunityDefaultHero.png";

const usePostDetailData = () => {
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

  const fetchCommunity = useCallback(async () => {
    try {
      const res = await apiFetch(`/community/${communityId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) return;
      setCommunity(data.community || null);
    } catch {}
  }, [communityId]);

  const fetchPost = useCallback(
    async ({ showLoader = false } = {}) => {
      try {
        if (showLoader) setLoading(true);
        setErr("");
        const res = await apiFetch(`/community/${communityId}/posts/${postId}`);
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

  useEffect(() => {
    fetchCommunity();
    fetchPost({ showLoader: true });
  }, [fetchCommunity, fetchPost]);

  useEffect(() => {
    const onActivity = () => fetchCommunity();
    window.addEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
    return () => window.removeEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
  }, [fetchCommunity]);

  const handleVoteToggle = useCallback(
    async (optionIndex) => {
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
    },
    [communityId, post, voting]
  );

  const heroBackgroundUrl = community?.heroImageUrl
    ? `${API_BASE}${community.heroImageUrl}`
    : DEFAULT_HERO;

  const heroStyle = useMemo(
    () => ({
      backgroundImage: `url("${heroBackgroundUrl}")`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    }),
    [heroBackgroundUrl]
  );

  const navigateBackUrl = `/community/${communityId}/my-posts`;

  return {
    communityId,
    postId,
    navigate,
    navigateBackUrl,
    heroStyle,
    community,
    post,
    loading,
    err,
    pollResults,
    myVotes,
    voting,
    voteError,
    handleVoteToggle,
    refetchPost: fetchPost,
    refetchCommunity: fetchCommunity,
  };
};

export default usePostDetailData;
