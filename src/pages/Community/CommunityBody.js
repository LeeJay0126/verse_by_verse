import { useState, useRef, useEffect, useCallback } from "react";
import "./CommunityBody.css";

import { FaPlus } from "react-icons/fa6";
import { PiBookOpenLight } from "react-icons/pi";
import { LuNotebookPen } from "react-icons/lu";
import CommunityCard from "./CommunityCard";
import { apiFetch } from "../../component/utils/ApiFetch";
import { normalizeCommunity } from "../../component/utils/communityNormalize";
import { COMMUNITY_ACTIVITY_EVENT } from "../../component/utils/CommunityEvents";

const MAX_DISCOVER_VISIBLE = 15;

const CommunityBody = () => {
  const [activeTab, setActiveTab] = useState("my");
  const [showAllMyCommunities, setShowAllMyCommunities] = useState(false);
  const [showAllDiscover, setShowAllDiscover] = useState(false);
  const [gridCols, setGridCols] = useState(3);

  const [visibleMyCount, setVisibleMyCount] = useState(0);
  const [visibleDiscoverCount, setVisibleDiscoverCount] = useState(0);

  const myRef = useRef(null);
  const discoverRef = useRef(null);
  const underlineRef = useRef(null);
  const gridRef = useRef(null);

  const [myCommunities, setMyCommunities] = useState([]);
  const [discoverCommunities, setDiscoverCommunities] = useState([]);

  const fetchMy = useCallback(async () => {
    try {
      const res = await apiFetch("/community/my");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) return;

      const mapped = (data.communities || [])
        .map((c) => ({
          ...normalizeCommunity(c),
          my: true,
        }))
        .sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));

      setMyCommunities(mapped);
    } catch (err) {
      console.error("[/community/my]", err);
    }
  }, []);

  const fetchDiscover = useCallback(async () => {
    try {
      const res = await apiFetch("/community/discover");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) return;

      const mapped = (data.communities || [])
        .map((c) => ({
          ...normalizeCommunity(c),
          my: false,
          role: null,
        }))
        .sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));

      setDiscoverCommunities(mapped);
    } catch (err) {
      console.error("[/community/discover]", err);
    }
  }, []);

  useEffect(() => {
    fetchMy();
    fetchDiscover();
  }, [fetchMy, fetchDiscover]);

  useEffect(() => {
    const onActivity = () => {
      fetchMy();
      fetchDiscover();
    };

    window.addEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
    return () => window.removeEventListener(COMMUNITY_ACTIVITY_EVENT, onActivity);
  }, [fetchMy, fetchDiscover]);

  useEffect(() => {
    const updateVisibleFromGrid = () => {
      if (!gridRef.current) return;

      const styles = window.getComputedStyle(gridRef.current);
      const templateColumns = styles.getPropertyValue("grid-template-columns");
      if (!templateColumns) return;

      const cols = templateColumns
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

      setGridCols(cols);
      setVisibleMyCount(Math.min(cols, myCommunities.length || cols));
      setVisibleDiscoverCount(Math.min(cols, discoverCommunities.length || cols));
    };

    updateVisibleFromGrid();
    window.addEventListener("resize", updateVisibleFromGrid);
    return () => window.removeEventListener("resize", updateVisibleFromGrid);
  }, [myCommunities.length, discoverCommunities.length, activeTab, gridCols]);

  const visibleMyCommunities = showAllMyCommunities
    ? myCommunities
    : myCommunities.slice(0, visibleMyCount);

  const maxDiscover = Math.min(MAX_DISCOVER_VISIBLE, discoverCommunities.length);
  const initialDiscoverCount = Math.min(visibleDiscoverCount, maxDiscover);

  const visibleDiscoverCommunities = showAllDiscover
    ? discoverCommunities.slice(0, maxDiscover)
    : discoverCommunities.slice(0, initialDiscoverCount);

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
                <CommunityCard key={community.id || index} {...community} />
              ))}
            </section>

            {!showAllMyCommunities && myCommunities.length > visibleMyCount && (
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
                <CommunityCard key={community.id || index} {...community} />
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
