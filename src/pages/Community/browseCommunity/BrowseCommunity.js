import { useEffect, useState, useCallback } from "react";
import "./BrowseCommunity.css";
import PageHeader from "../../../component/PageHeader";
import CommunityCard from "../CommunityCard";
import Footer from "../../../component/Footer";
import Time from "../../../component/utils/Time";
import { apiFetch } from "../../../component/utils/ApiFetch";

const formatLastActive = Time;

const BrowseCommunity = () => {
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastActiveFilter, setLastActiveFilter] = useState("");
  const [error, setError] = useState("");

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search.trim()) params.append("q", search.trim());
      if (typeFilter) params.append("type", typeFilter);
      if (sizeFilter) params.append("size", sizeFilter);
      if (lastActiveFilter) params.append("lastActive", lastActiveFilter); // 👈 NEW

      const res = await apiFetch(
        `/community/discover?${params.toString()}`);

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load communities");
      }

      const mapped = data.communities.map((c) => ({
        ...c,
        lastActive: formatLastActive(c.lastActivityAt || c.lastActive),
      }));

      setCommunities(mapped);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading communities");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, sizeFilter, lastActiveFilter]);

  // initial load
  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

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
            <div className="joinInputBox">
              <input
                type="text"
                className="joinHeroSearch"
                placeholder="Search by name, topic, or church…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchCommunities();
                }}
              />
              <button className="joinHeroSearchButton" onClick={fetchCommunities}>
                Search
              </button>
            </div>
            <div className="joinHeroFilters">
              <select
                className="joinHeroSelect"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Any type</option>
                <option value="Church Organization">Church organization</option>
                <option value="Bible Study">Bible study</option>
                <option value="Read Through">Read-through plan</option>
                <option value="Prayer Group">Prayer group</option>
                <option value="Other">Other</option>
              </select>

              <select
                className="joinHeroSelect"
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
              >
                <option value="">Any size</option>
                <option value="small">Small (2–10)</option>
                <option value="medium">Medium (11–30)</option>
                <option value="large">Large (31+)</option>
              </select>

              <select
                className="joinHeroSelect"
                value={lastActiveFilter}
                onChange={(e) => setLastActiveFilter(e.target.value)}
              >
                <option value="">Any activity</option>
                <option value="7d">Active in last 7 days</option>
                <option value="30d">Active in last 30 days</option>
                <option value="90d">Active in last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="joinCommunityMain">
        <div className="joinCommunityHeaderRow">
          <h2 className="joinCommunityHeading">Featured Communities</h2>
          <p className="joinCommunityCount">
            {loading
              ? "Loading…"
              : `${communities.length} communit${communities.length === 1 ? "y" : "ies"} shown`}
          </p>
        </div>

        {error && <p className="communityError">{error}</p>}

        <section className="joinCommunityGrid">
          {communities.filter(c => !c.my).map((community) => (
            <CommunityCard key={community.id} {...community} />
          ))}
        </section>


      </main>
      <Footer />
    </section>
  );
};

export default BrowseCommunity;
