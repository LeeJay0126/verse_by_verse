// src/community/JoinCommunity.jsx
import "./BrowseCommunity.css";
import CommunityCard from "../CommunityCard";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";

const BrowseCommunity = () => {
    // Temporary demo data; you can replace this with real API data later
    const featuredCommunities = [
        {
            header: "Young Adults Group",
            subheader: "Weekly Bible study with KTPC",
            content: "Walk through Scripture together every Friday night.",
            members: 24,
            lastActive: "2 hours ago",
            role: "Member",
        },
        {
            header: "Read Through the Bible in a Year",
            subheader: "Daily reading plan and summaries",
            content: "Stay on track with a community reading the whole Bible in one year.",
            members: 87,
            lastActive: "30 minutes ago",
            role: "Member",
        },
        {
            header: "Korean-English Fellowship",
            subheader: "Bilingual study and prayer",
            content: "Share insights and pray together in both Korean and English.",
            members: 41,
            lastActive: "1 day ago",
            role: "Member",
        },
        {
            header: "Mornings in the Psalms",
            subheader: "Short reflections to start your day",
            content: "Weekday morning reflections through the book of Psalms.",
            members: 53,
            lastActive: "3 hours ago",
            role: "Member",
        },
    ];

    return (
        <section className="JoinCommunity">
            <header className="joinHero">
                <PageHeader />
                <div className="joinHeroOverlay" />
                <div className="joinHeroContent">
                    <p className="joinHeroTag">Communities</p>
                    <h1 className="joinHeroTitle">Find a community to grow with</h1>
                    <p className="joinHeroSubtitle">
                        Join a group that studies the same passages, shares reflections, and walks through Scripture together.
                    </p>

                    <div className="joinHeroActions">
                        <input
                            type="text"
                            className="joinHeroSearch"
                            placeholder="Search by name, topic, or church…"
                        />
                        <div className="joinHeroFilters">
                            <select className="joinHeroSelect">
                                <option value="">Any type</option>
                                <option value="church">Church organization</option>
                                <option value="bible-study">Bible study</option>
                                <option value="reading-plan">Read-through plan</option>
                            </select>
                            <select className="joinHeroSelect">
                                <option value="">Any size</option>
                                <option value="small">Small (2–10)</option>
                                <option value="medium">Medium (11–30)</option>
                                <option value="large">Large (31+)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="joinCommunityMain">
                <div className="joinCommunityHeaderRow">
                    <h2 className="joinCommunityHeading">Featured Communities</h2>
                    <p className="joinCommunityCount">
                        {featuredCommunities.length} communities shown
                    </p>
                </div>

                <section className="joinCommunityGrid">
                    {featuredCommunities.map((community, index) => (
                        <CommunityCard
                            key={index}
                            header={community.header}
                            subheader={community.subheader}
                            content={community.content}
                            members={community.members}
                            lastActive={community.lastActive}
                            role={community.role}
                        />
                    ))}
                </section>
            </main>
            <Footer/>
        </section>
    );
};

export default BrowseCommunity;
