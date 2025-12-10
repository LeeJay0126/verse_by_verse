
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./MyCommunity.css";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";


const MyCommunity = () => {
    const { communityId } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");


    useEffect(() => {
        // TEMP: no fetch yet, we just use the static example below
    }, [communityId]);


    return (
        <section className="ForumContainer">
            <div className="ForumHero">
                <PageHeader />
                <div className="ForumHeaderContainer">
                    <h1 className="ForumHeader">
                        {/*Temporary Header. Needs to be replaced with actual community name when API is ready */}
                        Temporary Header
                    </h1>
                    <h2 className="ForumSubHeader">
                        {/*Temporary Subheader */}
                        Temporary SubHeader
                        Temporary SubHeader
                        Temporary SubHeader
                        Temporary SubHeader
                        Temporary SubHeader
                    </h2>
                </div>
            </div>
            <section className="ForumBody">
                <div className="ForumActions">
                    <button className="NewPostButton">New Post</button>
                </div>

                {err && <p className="communityError">{err}</p>}
                {loading && <p>Loading…</p>}

                {!loading && posts.length === 0 && !err && (
                    <p>You don’t have any posts in this community yet.</p>
                )}

                {!loading && posts.length > 0 && (
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
                                    <td>{post.activityText}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* temporary hard-coded example. don’t have API yet */}
                {posts.length === 0 && !loading && !err && (
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
            <Footer/>
        </section>
    );
};

export default MyCommunity;
