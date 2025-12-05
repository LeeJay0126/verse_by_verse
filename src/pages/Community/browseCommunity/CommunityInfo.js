import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import Time from "../../../component/utils/Time";
import { useToast } from "../../../component/context/ToastContext";
import "./CommunityInfo.css";

const CommunityInfo = () => {
  const { communityId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const initialCommunity = location.state?.community || null;

  const [community, setCommunity] = useState(initialCommunity);
  const [loading, setLoading] = useState(!initialCommunity);
  const [error, setError] = useState("");
  const [joinStatus, setJoinStatus] = useState("idle"); // idle | loading | requested | error

  // Always fetch full community detail so we get owner, leaders, members, etc.
  useEffect(() => {
    if (!communityId) return;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:4000/community/${communityId}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (!data.ok) {
          throw new Error(data.message || "Failed to load community");
        }

        const c = data.community;
        setCommunity({
          ...c,
          lastActive: Time(c.lastActivityAt || c.lastActive),
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load this community right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, [communityId]);

  const handleJoinClick = async () => {
    if (!community?.id) return;
    if (joinStatus === "loading" || joinStatus === "requested") return;

    try {
      setJoinStatus("loading");

      const res = await fetch(
        `http://localhost:4000/community/${community.id}/request-join`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to request join");
      }

      setJoinStatus("requested");
      showToast("Join request sent to the community owner", "success");
    } catch (err) {
      console.error("[join community error]", err);
      setJoinStatus("error");
      showToast(
        err.message || "Could not send join request. Please try again.",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <section className="CommunityInfo">
        <PageHeader />
        <div className="CommunityInfoBody">
          <p>Loading community information...</p>
        </div>
        <Footer />
      </section>
    );
  }

  if (error || !community) {
    return (
      <section className="CommunityInfo">
        <PageHeader />
        <div className="CommunityInfoBody">
          <p className="CommunityInfoError">
            {error || "Community not found."}
          </p>
          <button
            className="CommunityInfoBackButton"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
        <Footer />
      </section>
    );
  }

  const {
    header,
    subheader,
    content,
    type,
    lastActive,
    members = [],
    owner,
    leaders = [],
  } = community;

  // Normalize members for display (array vs number)
  const rawMembers = members;
  const memberList = Array.isArray(rawMembers) ? rawMembers : [];

  const memberCount =
    typeof community.membersCount === "number"
      ? community.membersCount
      : typeof rawMembers === "number"
      ? rawMembers
      : memberList.length;

  const joinButtonLabel =
    joinStatus === "loading"
      ? "Requesting…"
      : joinStatus === "requested"
      ? "Requested"
      : "Request to Join";

  const joinDisabled =
    joinStatus === "loading" || joinStatus === "requested";

  const MAX_DISPLAY_USERS = 5;

  const formatUserLabel = (user) => {
    if (!user) return "—";
    if (user.username) return user.username;
    if (user.fullName) return user.fullName;
    return "Unknown";
  };

  const displayedLeaders = leaders.slice(0, MAX_DISPLAY_USERS);
  const hasMoreLeaders = leaders.length > MAX_DISPLAY_USERS;

  const displayedMembers = memberList.slice(0, MAX_DISPLAY_USERS);
  const hasMoreMembers = memberList.length > MAX_DISPLAY_USERS;

  return (
    <section className="CommunityInfo">
      <div className="CommunityInfoHero">
        <PageHeader />
        <header className="CommunityInfoHeader">
          <h1 className="CommunityInfoTitle">{header}</h1>
          {subheader && (
            <p className="CommunityInfoSubtitle">{subheader}</p>
          )}
        </header>
      </div>

      <section className="CommunityInfoMeta">
        <div className="CommunityInfoMetaItem">
          <span className="CommunityInfoMetaLabel">Community type</span>
          <span className="CommunityInfoMetaValue">{type || "—"}</span>
        </div>

        <div className="CommunityInfoMetaItem">
          <span className="CommunityInfoMetaLabel">Members</span>
          <span className="CommunityInfoMetaValue">
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="CommunityInfoMetaItem">
          <span className="CommunityInfoMetaLabel">Last active</span>
          <span className="CommunityInfoMetaValue">
            {lastActive || "—"}
          </span>
        </div>
      </section>

      <section className="CommunityInfoDescription">
        <h2 className="CommunityInfoDescriptionTitle">
          About this community
        </h2>
        <p className="CommunityInfoDescriptionText">
          {content || "No description has been added yet."}
        </p>
      </section>

      <section className="CommunityInfoPeople">
        <h2 className="CommunityInfoPeopleTitle">People in this community</h2>

        <div className="CommunityInfoPeopleGrid">
          {/* Owner */}
          <div className="CommunityInfoPeopleBlock">
            <span className="CommunityInfoMetaLabel">Owner</span>
            <span className="CommunityInfoMetaValue">
              {owner ? formatUserLabel(owner) : "—"}
            </span>
          </div>

          {/* Leaders */}
          <div className="CommunityInfoPeopleBlock">
            <span className="CommunityInfoMetaLabel">Leaders</span>
            {leaders.length === 0 ? (
              <span className="CommunityInfoMetaValue">None yet</span>
            ) : (
              <ul className="CommunityInfoUserList">
                {displayedLeaders.map((user) => (
                  <li key={user.id} className="CommunityInfoUserItem">
                    {formatUserLabel(user)}
                  </li>
                ))}
                {hasMoreLeaders && (
                  <li className="CommunityInfoUserMore">…</li>
                )}
              </ul>
            )}
          </div>

          {/* Members */}
          <div className="CommunityInfoPeopleBlock">
            <span className="CommunityInfoMetaLabel">Members</span>
            {memberList.length === 0 ? (
              <span className="CommunityInfoMetaValue">No members yet</span>
            ) : (
              <ul className="CommunityInfoUserList">
                {displayedMembers.map((user) => (
                  <li key={user.id} className="CommunityInfoUserItem">
                    {formatUserLabel(user)}
                  </li>
                ))}
                {hasMoreMembers && (
                  <li className="CommunityInfoUserMore">…</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div className="CommunityInfoActions">
        <button
          className="CommunityInfoSecondaryButton"
          onClick={() => navigate(-1)}
        >
          Back to communities
        </button>

        <button
          className="CommunityInfoPrimaryButton"
          onClick={handleJoinClick}
          disabled={joinDisabled}
        >
          {joinButtonLabel}
        </button>
      </div>

      <Footer />
    </section>
  );
};

export default CommunityInfo;
