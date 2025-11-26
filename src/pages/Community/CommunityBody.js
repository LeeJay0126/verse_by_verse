import { useState, useRef, useEffect } from "react";
import "./CommunityBody.css";

import { FaPlus } from "react-icons/fa6";
import { PiBookOpenLight } from "react-icons/pi";
import { LuNotebookPen } from "react-icons/lu";
import CommunityCard from "./CommunityCard";

const CommunityBody = () => {
    const [activeTab, setActiveTab] = useState("my");
    const [showAllMyCommunities, setShowAllMyCommunities] = useState(false);
    const [visibleCount, setVisibleCount] = useState(3); 

    const myRef = useRef(null);
    const discoverRef = useRef(null);
    const underlineRef = useRef(null);
    const gridRef = useRef(null);

    // Demo data – later to be replaced with data from API / props
    const myCommunities = [
        {
            header: "Young Adults Group",
            subheader: "Weekly Bible study with KTPC",
            content: "Demo Community Card",
            members: 6,
            lastActive: "17 hours ago",
            role: "Owner",
        },
        {
            header: "Morning Devotionals Confirming the animation for length",
            subheader: "Start the day in the Word Confirming the animation for length",
            content: "Short daily readings and reflections. Confirming the animation for length",
            members: 12,
            lastActive: "2 hours ago",
            role: "Member",
        },
        {
            header: "Korean-English Study Group",
            subheader: "Bilingual Bible reading and sharing",
            content: "Share insights in both Korean and English.",
            members: 8,
            lastActive: "1 day ago",
            role: "Owner",
        },
        {
            header: "Friday Night Fellowship",
            subheader: "End the week with worship and study",
            content: "Hybrid in-person and online gatherings.",
            members: 15,
            lastActive: "3 days ago",
            role: "Member",
        },
    ];

    // Sync visibleCount with actual grid-template-columns
    useEffect(() => {
        const updateVisibleFromGrid = () => {
            if (!gridRef.current) return;

            const styles = window.getComputedStyle(gridRef.current);
            const templateColumns = styles.getPropertyValue("grid-template-columns");

            if (!templateColumns) return;

            // "1fr 1fr 1fr" to ["1fr","1fr","1fr"] → 3
            const cols = templateColumns
                .trim()
                .split(/\s+/)
                .filter(Boolean).length;

            // Safety: don't exceed number of communities
            const count = Math.min(cols, myCommunities.length);

            setVisibleCount(count);
        };

        updateVisibleFromGrid();
        window.addEventListener("resize", updateVisibleFromGrid);

        return () => {
            window.removeEventListener("resize", updateVisibleFromGrid);
        };
    }, [myCommunities.length]);

    const visibleMyCommunities = showAllMyCommunities
        ? myCommunities
        : myCommunities.slice(0, visibleCount);

    useEffect(() => {
        const tabRef = activeTab === "my" ? myRef : discoverRef;
        const underline = underlineRef.current;

        if (tabRef.current && underline) {
            const { offsetLeft, offsetWidth } = tabRef.current;

            underline.style.width = `${offsetWidth}px`;
            underline.style.transform = `translateX(${offsetLeft}px)`;
        }
    }, [activeTab]);

    return (
        <section className="CommunityBody">
            <div className="communityBodyBC">
                <button
                    ref={myRef}
                    className={`communityBodyB ${activeTab === "my" ? "active" : ""}`}
                    onClick={() => setActiveTab("my")}
                >
                    My Communities
                </button>

                <button
                    ref={discoverRef}
                    className={`communityBodyB ${activeTab === "discover" ? "active" : ""}`}
                    onClick={() => setActiveTab("discover")}
                >
                    Discover
                </button>

                <span className="underline" ref={underlineRef} />
            </div>

            <div className="communityDisplayArea">
                {activeTab === "my" ? (
                    <>
                        <section className="communityCardGrid" ref={gridRef}>
                            {visibleMyCommunities.map((community, index) => (
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

                        {!showAllMyCommunities &&
                            myCommunities.length > visibleCount && (
                                <div className="communityShowMoreWrapper">
                                    <button
                                        className="communityShowMoreButton"
                                        onClick={() => setShowAllMyCommunities(true)}
                                    >
                                        Show More
                                    </button>
                                </div>
                            )}
                    </>
                ) : (
                    "Discover communities…"
                )}
            </div>

            <section className="studyHowSection">
                <h3 className="studyHowHeader">How Community Study Works</h3>
                <ul className="studyHowCardContainer">
                    <li className="studyCard">
                        <FaPlus className="studyCardIcon" />
                        <div>
                            <h3 className="studyCardHeader">Create or Join</h3>
                            <p className="studyCardContent">
                                Start your own study group or join a community that matches your
                                interests. Connect quickly and begin studying together right away.
                            </p>
                        </div>
                    </li>

                    <li className="studyCard">
                        <PiBookOpenLight className="studyCardIcon" />
                        <div>
                            <h3 className="studyCardHeader">Read Together</h3>
                            <p className="studyCardContent">
                                Follow the same passages as your community and move through
                                Scripture in sync, making study and discussion simple and unified.
                            </p>
                        </div>
                    </li>

                    <li className="studyCard">
                        <LuNotebookPen className="studyCardIcon" />
                        <div>
                            <h3 className="studyCardHeader">Share Memos</h3>
                            <p className="studyCardContent">
                                Write reflections and insights in a shared memo space where
                                everyone can see, contribute, and grow together.
                            </p>
                        </div>
                    </li>
                </ul>
            </section>
        </section>
    );
};

export default CommunityBody;
