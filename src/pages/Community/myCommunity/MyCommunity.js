import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useAuth } from "../../../component/context/AuthContext";
import "./MyCommunity.css";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import NewPostModal from "./NewPost";
import Time from "../../../component/utils/Time";
import { apiFetch } from "../../../component/utils/ApiFetch";
import { buildHeroStyle } from "../../../component/utils/ApiConfig";
import { FiTrash2 } from "react-icons/fi";

import {
  COMMUNITY_ACTIVITY_EVENT,
  emitCommunityActivityUpdated,
} from "../../../component/utils/CommunityEvents";

import {
  getTypeLabel,
  getTypeTagClass,
} from "../communityTypes";
import {
  canCreateAnnouncement,
  canCreateBibleStudy,
  canManageMembers as canManageMembersAccess,
  canModerateCommunityPosts,
  getCommunityRole,
  isCommunityMember,
} from "../../../component/utils/communityAccess";
import Pager from "./postDetail/components/Pager";

const MAX_ANNOUNCEMENTS_PER_COMMUNITY = 3;
const POSTS_PER_PAGE = 12;

const MyCommunity = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [communityErr, setCommunityErr] = useState("");

  const [posts, setPosts] = useState([]);
  const [postsMeta, setPostsMeta] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
    limit: POSTS_PER_PAGE,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostError, setNewPostError] = useState("");

  const fileInputRef = useRef(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [deletingPostId, setDeletingPostId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const [page, setPage] = useState(1);
  const creatingPostRef = useRef(false);

  const currentUserId = String(user?.id || user?._id || "");
  const currentRole = useMemo(() => getCommunityRole(community, currentUserId), [community, currentUserId]);

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

  const fetchPosts = useCallback(
    async (nextPage = page) => {
      try {
        setLoading(true);
        setErr("");
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: String(POSTS_PER_PAGE),
        });

        const res = await apiFetch(`/community/${communityId}/posts?${params.toString()}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `Failed to load posts (${res.status})`);
        }

        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setPostsMeta({
          page: Number(data.page || nextPage || 1),
          totalPages: Math.max(1, Number(data.totalPages || 1)),
          totalCount: Number(data.totalCount || 0),
          limit: Number(data.limit || POSTS_PER_PAGE),
        });
      } catch (error) {
        console.error("[MyCommunity] fetchPosts error:", error);
        setErr(error.message || "Failed to load posts.");
      } finally {
        setLoading(false);
      }
    },
    [communityId, page]
  );

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  useEffect(() => {
    fetchPosts(page);
  }, [fetchPosts, page]);

  useEffect(() => {
    const onActivity = () => {
      fetchCommunity();
      fetchPosts(page);
    };
    window.addEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
    return () => window.removeEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
  }, [fetchCommunity, fetchPosts, page]);

  const handleNewPostClick = () => {
    setNewPostError("");
    setShowNewPostModal(true);
  };

  const handleCloseModal = () => {
    setNewPostError("");
    setShowNewPostModal(false);
  };

  const announcementCount = useMemo(() => {
    return posts.filter((post) => String(post.type || "").toLowerCase() === "announcements").length;
  }, [posts]);

  const handleCreatePost = async (newPostPayload) => {
    if (creatingPostRef.current) {
      const message = "Post creation is already in progress.";
      setNewPostError(message);
      return { ok: false, message };
    }

    try {
      creatingPostRef.current = true;
      setNewPostError("");

      const payloadType = String(newPostPayload?.type || newPostPayload?.typeValue || "").toLowerCase();

      if (payloadType === "announcements" && announcementCount >= MAX_ANNOUNCEMENTS_PER_COMMUNITY) {
        const message = `This community already has ${MAX_ANNOUNCEMENTS_PER_COMMUNITY} announcements on this page.`;
        setNewPostError(message);
        return { ok: false, message };
      }

      if (payloadType === "announcements" && !canCreateAnnouncementPost) {
        const message = "Only community leaders or the owner can create announcements.";
        setNewPostError(message);
        return { ok: false, message };
      }

      const res = await apiFetch(`/community/${communityId}/posts`, {
        method: "POST",
        body: JSON.stringify({
          title: newPostPayload?.title,
          body: newPostPayload?.body,
          type: newPostPayload?.type || newPostPayload?.typeValue || "bible_study",
          poll: newPostPayload?.poll,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        const message = data.error || "Failed to create post.";
        setNewPostError(message);
        return { ok: false, message };
      }

      setPage(1);
      await fetchPosts(1);
      await fetchCommunity();

      emitCommunityActivityUpdated();

      setShowNewPostModal(false);
      return { ok: true };
    } catch (error) {
      console.error("[MyCommunity] handleCreatePost error:", error);
      const message = error.message || "Failed to create post.";
      setNewPostError(message);
      return { ok: false, message };
    } finally {
      creatingPostRef.current = false;
    }
  };

  const hasRealPosts = postsMeta.totalCount > 0;

  const formatActivity = (post) => {
    const date = post.updatedAt || post.createdAt;
    if (!date) return "Just now";
    return Time(date);
  };

  const heroStyle = useMemo(() => buildHeroStyle(community?.heroImageUrl), [community]);

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

  const canEditHero = currentRole === "Owner" || currentRole === "Leader";
  const canCreateAnnouncementPost = canCreateAnnouncement(community, currentUserId);
  const canModeratePosts = canModerateCommunityPosts(community, currentUserId);

  const canEditOrDeletePost = useCallback(
    (post) => {
      const authorId = String(post?.authorId || "");
      if (!currentUserId) return false;

      const isAuthor = authorId && authorId === currentUserId;
      return isAuthor || canModeratePosts;
    },
    [currentUserId, canModeratePosts]
  );

  const handleDeletePost = useCallback(
    async (postId) => {
      if (!postId || deletingPostId) return;

      setDeleteError("");
      const ok = window.confirm("Delete this post? This cannot be undone.");
      if (!ok) return;

      try {
        setDeletingPostId(String(postId));

        const res = await apiFetch(`/community/${communityId}/posts/${postId}`, {
          method: "DELETE",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to delete post.");
        }

        const nextTotal = Math.max(0, Number(postsMeta.totalCount || 0) - 1);
        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / POSTS_PER_PAGE));
        const nextPage = Math.min(page, nextTotalPages);

        setPage(nextPage);
        await fetchPosts(nextPage);
        await fetchCommunity();

        emitCommunityActivityUpdated();
      } catch (e) {
        console.error("[MyCommunity] delete post error:", e);
        setDeleteError(e.message || "Failed to delete post.");
      } finally {
        setDeletingPostId(null);
      }
    },
    [communityId, deletingPostId, fetchCommunity, fetchPosts, page, postsMeta.totalCount]
  );

  const canManageMembers = canManageMembersAccess(community, currentUserId);
  const isMember = isCommunityMember(community, currentUserId);

  const handleManageMembersClick = () => {
    navigate(`/community/${communityId}/members/manage`);
  };

  const manageLabel = canManageMembers ? "Manage" : "Settings";
  const pageInfoText = hasRealPosts
    ? `Showing page ${postsMeta.page} of ${postsMeta.totalPages} · ${postsMeta.totalCount} total posts`
    : "";

  return (
    <section className="ForumContainer">
      <div className="ForumHero" style={heroStyle}>
        <PageHeader />

        <div className="ForumHeaderContainer">
          <h1 className="ForumHeader">{community?.header || "Community"}</h1>
          <h2 className="ForumSubHeader">{community?.subheader || ""}</h2>
          {communityErr && <p className="communityError smallError">{communityErr}</p>}
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

      {uploadError && <div className="HeroUploadError NewPostGlobalError">{uploadError}</div>}

      <section className="ForumBody">
        <div className="ForumActions">
          {isMember && (
            <button className="ManageButton" onClick={handleManageMembersClick}>
              {manageLabel}
            </button>
          )}
          <button className="NewPostButton" onClick={handleNewPostClick}>
            New Post
          </button>
        </div>

        {err && <p className="communityError">{err}</p>}
        {deleteError && <p className="communityError">{deleteError}</p>}
        {loading && <p>Loading…</p>}

        {!loading && !err && !hasRealPosts && <p>You don’t have any posts in this community yet.</p>}

        {!loading && !err && hasRealPosts && (
          <>
            <div className="PostDetailRepliesPagerTop" style={{ marginBottom: 12 }}>
              <span className="PostDetailPagerMeta">{pageInfoText}</span>
              <Pager page={page} totalPages={postsMeta.totalPages} onPageChange={setPage} />
            </div>

            <table className="ForumTable">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Category</th>
                  <th>Replies</th>
                  <th>Activity</th>
                  <th className="ForumActionsCol">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="ForumRow" onClick={() => handleRowClick(post.id)}>
                    <td className="topic">
                      <div className="title">{post.title}</div>
                      <div className="subtitle">{post.subtitle}</div>
                    </td>
                    <td>
                      <span className={`Tag ${getTypeTagClass(post)}`}>{getTypeLabel(post)}</span>
                    </td>
                    <td>{post.replyCount}</td>
                    <td>{formatActivity(post)}</td>
                    <td
                      className={`ForumActionsCell ${canEditOrDeletePost(post) ? "can-delete" : ""}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canEditOrDeletePost(post) && (
                        <button
                          type="button"
                          className="PostDeleteIcon"
                          aria-label="Delete post"
                          title="Delete"
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingPostId === String(post.id)}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="PostDetailRepliesPagerBottom">
              <Pager page={page} totalPages={postsMeta.totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </section>

      {showNewPostModal && (
        <NewPostModal
          communityId={communityId}
          onClose={handleCloseModal}
          onSubmit={handleCreatePost}
          announcementCount={announcementCount}
          canCreateAnnouncement={canCreateAnnouncementPost}
          canCreateBibleStudy={canCreateBibleStudy(community, currentUserId)}
        />
      )}

      {newPostError && (
        <div className="NewPostGlobalError" style={{ margin: "0 0 24px" }}>
          {newPostError}
        </div>
      )}

      <Footer />
    </section>
  );
};

export default MyCommunity;
