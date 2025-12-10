import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import "./MyCommunity.css";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import NewPostModal from "./NewPost";
import Time from "../../../component/utils/Time";

const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const MyCommunity = () => {
    const { communityId } = useParams();

    const [community, setCommunity] = useState(null);
    const [communityErr, setCommunityErr] = useState("");

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [showNewPostModal, setShowNewPostModal] = useState(false);

    const fetchCommunity = useCallback(async () => {
        try {
            setCommunityErr("");

            const res = await fetch(`${API_BASE}/community/${communityId}`, {
                credentials: "include",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Failed to load community (${res.status})`);
            }

            const data = await res.json();
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

            const res = await fetch(
                `${API_BASE}/community/${communityId}/posts`,
                { credentials: "include" }
            );

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Failed to load posts (${res.status})`);
            }

            const data = await res.json();
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

    const handleNewPostClick = () => setShowNewPostModal(true);
    const handleCloseModal = () => setShowNewPostModal(false);

    const handleCreatePost = async (newPostPayload) => {
        try {
            const res = await fetch(
                `${API_BASE}/community/${communityId}/posts`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        title: newPostPayload.title,
                        body: newPostPayload.description,
                        type: newPostPayload.typeValue,
                    }),
                }
            );

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                return {
                    ok: false,
                    message: data.error || "Failed to create post.",
                };
            }

            await fetchPosts();
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
        // Time util you already use for "last active"
        return Time(date);
    };

    return (
        <section className="ForumContainer">
            <div className="ForumHero">
                <PageHeader />
                <div className="ForumHeaderContainer">
                    <h1 className="ForumHeader">
                        {community?.header || "Temporary Header"}
                    </h1>
                    <h2 className="ForumSubHeader">
                        {community?.subheader ||
                            "Temporary SubHeader Temporary SubHeader Temporary SubHeader Temporary SubHeader Temporary SubHeader"}
                    </h2>
                    {communityErr && (
                        <p className="communityError smallError">{communityErr}</p>
                    )}
                </div>
            </div>

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
                                <tr key={post.id}>
                                    <td className="topic">
                                        <div className="title">{post.title}</div>
                                        <div className="subtitle">{post.subtitle}</div>
                                    </td>
                                    <td>
                                        <span className={`Tag ${post.categoryClass || "general"}`}>
                                            {post.category}
                                        </span>
                                    </td>
                                    <td>{post.replyCount}</td>
                                    <td>{formatActivity(post)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* fallback demo table if no real posts */}
                {!loading && !err && !hasRealPosts && (
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
                            <tr>
                                <td className="topic">
                                    <div className="title">Welcome to the community!</div>
                                    <div className="subtitle">We’re excited to have you here.</div>
                                </td>
                                <td><span className="Tag general">General</span></td>
                                <td>1</td>
                                <td>2h ago</td>
                            </tr>
                            <tr>
                                <td className="topic">
                                    <div className="title">How do I reset my password?</div>
                                    <div className="subtitle">
                                        I forgot my password and need to reset it.
                                    </div>
                                </td>
                                <td><span className="Tag questions">Questions</span></td>
                                <td>3</td>
                                <td>5h ago</td>
                            </tr>
                            <tr>
                                <td className="topic">
                                    <div className="title">New features are coming soon</div>
                                    <div className="subtitle">Here's a sneak peek.</div>
                                </td>
                                <td><span className="Tag announcements">Announcements</span></td>
                                <td>1</td>
                                <td>1d ago</td>
                            </tr>
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
