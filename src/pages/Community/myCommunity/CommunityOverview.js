import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CommunityOverview.css";
import { apiFetch } from "../../../component/utils/ApiFetch";
import { normalizeCommunity } from "../../../component/utils/communityNormalize";
import { useAuth } from "../../../component/context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
const DEFAULT_HERO = "/community/CommunityDefaultHero.png";

const CommunityOverview = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!communityId) return;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await apiFetch(`/community/${communityId}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load community");
        }

        setCommunity(normalizeCommunity(data.community));
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load community.");
      } finally {
        setLoading(false);
      }
    })();
  }, [communityId]);

  const currentUserId = String(user?.id || user?._id || "");

  const isMember = useMemo(() => {
    if (!community || !currentUserId) return false;

    if (typeof community.isMember === "boolean") return community.isMember;

    const membersArr = Array.isArray(community.membersList)
      ? community.membersList
      : Array.isArray(community.members)
        ? community.members
        : [];

    return membersArr.some((m) => {
      const id = String(m?.id || m?._id || "");
      return id && id === currentUserId;
    });
  }, [community, currentUserId]);

  const heroBackgroundUrl = community?.heroImageUrl
    ? `${API_BASE}${community.heroImageUrl}`
    : DEFAULT_HERO;

  const heroStyle = {
    backgroundImage: `url("${heroBackgroundUrl}")`,
    backgroundColor: "#00000080",
    backgroundBlendMode: "saturation",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

  if (loading) {
    return <div className="CommunityOverviewLoading">Loading…</div>;
  }

  if (error || !community) {
    return (
      <div className="CommunityOverviewError">
        <p>{error || "Community not found."}</p>
        <button
          type="button"
          className="CommunityOverviewSecondaryButton"
          onClick={() => navigate("/community")}
        >
          Back to communities
        </button>
      </div>
    );
  }

  const memberCount = community.membersCount ?? 0;

  return (
    <section className="CommunityOverview">
      <div className="CommunityOverviewHero" style={heroStyle}>
        <button
          type="button"
          className="CommunityBackArrow"
          onClick={() => navigate("/community")}
          aria-label="Back to Communities"
          title="Back to Communities"
        >
          ←
        </button>

        <header className="CommunityOverviewHeader">
          <h1 className="CommunityOverviewTitle">{community.header}</h1>
          {community.subheader && (
            <p className="CommunityOverviewSubtitle">{community.subheader}</p>
          )}
        </header>
      </div>

      <section className="CommunityOverviewMeta">
        <div className="CommunityOverviewMetaItem">
          <span className="CommunityOverviewMetaLabel">Community type</span>
          <span className="CommunityOverviewMetaValue">{community.type || "—"}</span>
        </div>

        <div className="CommunityOverviewMetaItem">
          <span className="CommunityOverviewMetaLabel">Members</span>
          <span className="CommunityOverviewMetaValue">
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="CommunityOverviewMetaItem">
          <span className="CommunityOverviewMetaLabel">Last active</span>
          <span className="CommunityOverviewMetaValue">{community.lastActive || "—"}</span>
        </div>
      </section>

      <section className="CommunityOverviewDescription">
        <h2 className="CommunityOverviewSectionTitle">About</h2>
        <p className="CommunityOverviewDescriptionText">
          {community.content || "No description has been added yet."}
        </p>
      </section>

      <div className="CommunityOverviewActions">
        <button
          type="button"
          className="CommunityOverviewSecondaryButton"
          onClick={() =>
            navigate(`/community/${community.id}/info`, {
              state: { community },
            })
          }
        >
          View details
        </button>

        {isMember ? (
          <button
            type="button"
            className="CommunityOverviewPrimaryButton"
            onClick={() => navigate(`/community/${community.id}/my-posts`)}
          >
            Go to posts
          </button>
        ) : (
          <button
            type="button"
            className="CommunityOverviewPrimaryButton"
            onClick={() =>
              navigate(`/community/${community.id}/info`, {
                state: { community },
              })
            }
          >
            Request to join
          </button>
        )}
      </div>
    </section>
  );
};

export default CommunityOverview;
