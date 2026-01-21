import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../../component/context/AuthContext";
import "./MyCommunity.css";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import NewPostModal from "./NewPost";
import Time from "../../../component/utils/Time";
import { apiFetch } from "../../../component/utils/ApiFetch";
import {
  COMMUNITY_ACTIVITY_EVENT,
  emitCommunityActivityUpdated,
} from "../../../component/utils/CommunityEvents";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
const DEFAULT_HERO = "/community/CommunityDefaultHero.png";

const MyCommunity = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [communityErr, setCommunityErr] = useState("");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  const fileInputRef = useRef(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleRowClick = (postId) => {
    navigate(`/community/${communityId}/posts/${postId}`);
  };

  const fetchCommunity = useCallback(async () => {
    try {
      setCommunityErr("");
      const res = await apiFetch(`/community/${communityId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Failed to load community (${res.status})`);
      }
      setCommunity(data.community || null);
    } catch (error) {
      console.error("[MyCommunity] fetchCommunity error:", error);
      setCommunityErr(error.message || "Failed to load community.");
    }
  }, [communityId]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await apiFetch(`/community/${communityId}/posts`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Failed to load posts (${res.status})`);
      }
      setPosts(data.posts || []);
    } catch (error) {
      console.error("[MyCommunity] fetchPosts error:", error);
      setErr(error.message || "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchCommunity();
    fetchPosts();
  }, [fetchCommunity, fetchPosts]);

  useEffect(() => {
    const onActivity = () => {
      fetchCommunity();
      fetchPosts();
    };
    window.addEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
    return () => window.removeEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
  }, [fetchCommunity, fetchPosts]);

  const handleNewPostClick = () => setShowNewPostModal(true);
  const handleCloseModal = () => setShowNewPostModal(false);

  const handleCreatePost = async (newPostPayload) => {
    try {
      const res = await apiFetch(`/community/${communityId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPostPayload.title,
          body: newPostPayload.description,
          type: newPostPayload.typeValue,
          poll: newPostPayload.poll,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        return { ok: false, message: data.error || "Failed to create post." };
      }

      await fetchPosts();
      await fetchCommunity();

      emitCommunityActivityUpdated();

      setShowNewPostModal(false);
      return { ok: true };
    } catch (error) {
      console.error("[MyCommunity] handleCreatePost error:", error);
      return { ok: false, message: error.message || "Failed to create post." };
    }
  };

  const hasRealPosts = posts.length > 0;

  const formatActivity = (post) => {
    const date = post.updatedAt || post.createdAt;
    if (!date) return "Just now";
    return Time(date);
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

  const handleHeroUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleHeroFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploadingHero(true);

    try {
      const formData = new FormData();
      formData.append("heroImage", file);

      const res = await apiFetch(`/community/${communityId}/hero-image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to upload hero image.");
      }

      await fetchCommunity();
      emitCommunityActivityUpdated();
    } catch (error) {
      console.error("[MyCommunity] hero upload error:", error);
      setUploadError(error.message || "Failed to upload hero image.");
    } finally {
      setUploadingHero(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const canEditHero = (() => {
    if (!community || !user) return false;

    const currentUserId = user.id || user._id;
    const isOwner = community.owner && community.owner.id === currentUserId;

    const isLeader =
      Array.isArray(community.members) &&
      community.members.some(
        (m) =>
          (m.role === "Leader" || m.role === "Owner") && m.id === currentUserId
      );

    return isOwner || isLeader;
  })();

  return (
    <section className="ForumContainer">
      <div className="ForumHero" style={heroStyle}>
        <PageHeader />

        <div className="ForumHeaderContainer">
          <h1 className="ForumHeader">{community?.header || "Temporary Header"}</h1>
          <h2 className="ForumSubHeader">
            {community?.subheader ||
              "Temporary SubHeader Temporary SubHeader Temporary SubHeader Temporary SubHeader Temporary SubHeader"}
          </h2>
          {communityErr && (
            <p className="communityError smallError">{communityErr}</p>
          )}
        </div>

        {canEditHero && (
          <div className="HeroUploadControl">
            <button
              type="button"
              className="HeroUploadButton"
              onClick={handleHeroUploadButtonClick}
              disabled={uploadingHero}
            >
              {uploadingHero ? "…" : "+"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="HeroUploadInput"
              onChange={handleHeroFileChange}
            />
          </div>
        )}
      </div>

      {uploadError && (
        <div className="HeroUploadError NewPostGlobalError">{uploadError}</div>
      )}

      <section className="ForumBody">
        <div className="ForumActions">
          <button className="NewPostButton" onClick={handleNewPostClick}>
            New Post
          </button>
        </div>

        {err && <p className="communityError">{err}</p>}
        {loading && <p>Loading…</p>}

        {!loading && !err && !hasRealPosts && (
          <p>You don’t have any posts in this community yet.</p>
        )}

        {!loading && !err && hasRealPosts && (
          <table className="ForumTable">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Category</th>
                <th>Replies</th>
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="ForumRow"
                  onClick={() => handleRowClick(post.id)}
                >
                  <td className="topic">
                    <div className="title">{post.title}</div>
                    <div className="subtitle">{post.subtitle}</div>
                  </td>
                  <td>
                    <span className={`Tag ${post.categoryClass || "general"}`}>
                      {post.category === "Poll" ? "📊 Poll" : post.category}
                    </span>
                  </td>
                  <td>{post.replyCount}</td>
                  <td>{formatActivity(post)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showNewPostModal && (
        <NewPostModal onClose={handleCloseModal} onSubmit={handleCreatePost} />
      )}

      <Footer />
    </section>
  );
};

export default MyCommunity;
