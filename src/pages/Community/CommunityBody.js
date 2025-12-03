import { useState, useRef, useEffect } from "react";
import "./CommunityBody.css";

import { FaPlus } from "react-icons/fa6";
import { PiBookOpenLight } from "react-icons/pi";
import { LuNotebookPen } from "react-icons/lu";
import CommunityCard from "./CommunityCard";
import Time from "../../component/utils/Time";

const MAX_DISCOVER_VISIBLE = 15;

const formatLastActive = Time;

const CommunityBody = () => {
  const [activeTab, setActiveTab] = useState("my");
  const [showAllMyCommunities, setShowAllMyCommunities] = useState(false);
  const [showAllDiscover, setShowAllDiscover] = useState(false);
  const [gridCols, setGridCols] = useState(3);

  // separate visible counts for each tab
  const [visibleMyCount, setVisibleMyCount] = useState(0);
  const [visibleDiscoverCount, setVisibleDiscoverCount] = useState(0);

  const myRef = useRef(null);
  const discoverRef = useRef(null);
  const underlineRef = useRef(null);
  const gridRef = useRef(null);

  const [myCommunities, setMyCommunities] = useState([]);
  const [discoverCommunities, setDiscoverCommunities] = useState([]);

  // --- My Communities ---
  useEffect(() => {
    fetch("http://localhost:4000/community/my", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) return;
        const mapped = data.communities.map((c) => ({
          ...c,
          lastActive: formatLastActive(c.lastActivityAt || c.lastActive),
          my: true,
        }));
        setMyCommunities(mapped);
      })
      .catch((err) => console.error(err));
  }, []);

  // --- Discover Communities ---
  useEffect(() => {
    fetch("http://localhost:4000/community/discover", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) return;
        const mapped = data.communities.map((c) => ({
          ...c,
          lastActive: formatLastActive(c.lastActivityAt || c.lastActive),
        }));
        setDiscoverCommunities(mapped);
      })
      .catch((err) => console.error(err));
  }, []);

  // Sync visible counts with actual grid-template-columns
  useEffect(() => {
    const updateVisibleFromGrid = () => {
      if (!gridRef.current) return;

      const styles = window.getComputedStyle(gridRef.current);
      const templateColumns = styles.getPropertyValue("grid-template-columns");
      if (!templateColumns) return;

      // "1fr 1fr" → 2
      const cols = templateColumns
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

      setGridCols(cols);

      // My tab: show up to cols or total communities
      setVisibleMyCount((prev) => Math.min(cols, myCommunities.length || cols));

      // Discover tab: initial visible count = cols (we'll cap to 15 later)
      setVisibleDiscoverCount((prev) => cols);
    };

    updateVisibleFromGrid();
    window.addEventListener("resize", updateVisibleFromGrid);
    return () => window.removeEventListener("resize", updateVisibleFromGrid);
  }, [myCommunities.length]);

  // --- My tab visible list ---
  const visibleMyCommunities = showAllMyCommunities
    ? myCommunities
    : myCommunities.slice(0, visibleMyCount);

  // --- Discover tab visible list ---
  const maxDiscover = Math.min(MAX_DISCOVER_VISIBLE, discoverCommunities.length);
  const initialDiscoverCount = Math.min(visibleDiscoverCount, maxDiscover);

  const visibleDiscoverCommunities = showAllDiscover
    ? discoverCommunities.slice(0, maxDiscover)
    : discoverCommunities.slice(0, initialDiscoverCount);

  // underline animation for active tab
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
          className={`communityBodyB ${activeTab === "discover" ? "active" : ""
            }`}
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
                  key={community.id || index}
                  id={community.id}
                  header={community.header}
                  subheader={community.subheader}
                  content={community.content}
                  members={community.members}
                  lastActive={community.lastActive}
                  role={community.role}
                  my={community.my}
                  type={community.type}
                />
              ))}
            </section>

            {!showAllMyCommunities &&
              myCommunities.length > visibleMyCount && (
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
          <>
            <section className="communityCardGrid" ref={gridRef}>
              {visibleDiscoverCommunities.map((community, index) => (
                <CommunityCard
                  key={community.id || index}
                  id={community.id}
                  header={community.header}
                  subheader={community.subheader}
                  content={community.content}
                  members={community.members}
                  lastActive={community.lastActive}
                  role={community.role}
                  my={community.my}
                  type={community.type}
                />
              ))}
            </section>

            {!showAllDiscover && maxDiscover > initialDiscoverCount && (
              <div className="communityShowMoreWrapper">
                <button
                  className="communityShowMoreButton"
                  onClick={() => setShowAllDiscover(true)}
                >
                  Show More
                </button>
              </div>
            )}
          </>
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
                interests. Connect quickly and begin studying together right
                away.
              </p>
            </div>
          </li>

          <li className="studyCard">
            <PiBookOpenLight className="studyCardIcon" />
            <div>
              <h3 className="studyCardHeader">Read Together</h3>
              <p className="studyCardContent">
                Follow the same passages as your community and move through
                Scripture in sync, making study and discussion simple and
                unified.
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
