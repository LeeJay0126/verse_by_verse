import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaChurch, FaCrown, FaRegClock, FaUserShield, FaUsers } from "react-icons/fa6";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import Time from "../../../component/utils/Time";
import { useToast } from "../../../component/context/ToastContext";
import "./CommunityInfo.css";
import { apiFetch } from "../../../component/utils/ApiFetch";
import { buildHeroStyle } from "../../../component/utils/ApiConfig";

const DEFAULT_HERO = "/community/CommunityDefaultHero.png";
const MAX_DISPLAY_USERS = 5;

const formatUserLabel = (user) => {
  if (!user) return "Unknown";
  if (user.username) return user.username;
  if (user.fullName) return user.fullName;
  if (user.name) return user.name;
  return "Unknown";
};

const CommunityInfo = () => {
  const { communityId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const initialCommunity = location.state?.community || null;

  const [community, setCommunity] = useState(initialCommunity);
  const [loading, setLoading] = useState(!initialCommunity);
  const [error, setError] = useState("");
  const [joinStatus, setJoinStatus] = useState("idle");

  useEffect(() => {
    if (!communityId) return;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await apiFetch(`/community/${communityId}`);
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.message || data.error || "Failed to load community");
        }

        const nextCommunity = data.community;
        setCommunity({
          ...nextCommunity,
          lastActive: Time(nextCommunity.lastActivityAt || nextCommunity.lastActive),
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

      const res = await apiFetch(`/community/${community.id}/request-join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

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
        <div className="CommunityInfoState">
          <span className="CommunityInfoStateIcon">
            <FaChurch />
          </span>
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
        <div className="CommunityInfoState CommunityInfoState--error">
          <span className="CommunityInfoStateIcon">
            <FaChurch />
          </span>
          <p>{error || "Community not found."}</p>
          <button
            type="button"
            className="CommunityInfoSecondaryButton"
            onClick={() => navigate(-1)}
          >
            Go back
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
    heroImageUrl,
  } = community;

  const memberList = Array.isArray(members) ? members : [];
  const memberCount =
    typeof community.membersCount === "number"
      ? community.membersCount
      : typeof members === "number"
        ? members
        : memberList.length;

  const joinButtonLabel =
    joinStatus === "loading"
      ? "Requesting..."
      : joinStatus === "requested"
        ? "Requested"
        : "Request to Join";

  const joinDisabled = joinStatus === "loading" || joinStatus === "requested";

  const heroStyle = {
    ...buildHeroStyle(heroImageUrl, DEFAULT_HERO),
    backgroundBlendMode: "multiply",
  };

  const displayedLeaders = leaders.slice(0, MAX_DISPLAY_USERS);
  const hasMoreLeaders = leaders.length > MAX_DISPLAY_USERS;
  const displayedMembers = memberList.slice(0, MAX_DISPLAY_USERS);
  const hasMoreMembers = memberList.length > MAX_DISPLAY_USERS;

  return (
    <section className="CommunityInfo">
      <div className="CommunityInfoHero" style={heroStyle}>
        <PageHeader />
        <button
          type="button"
          className="CommunityInfoBackButton"
          onClick={() => navigate(-1)}
          aria-label="Back to communities"
        >
          <FaArrowLeft />
        </button>

        <div className="CommunityInfoHeroOverlay">
          <div className="CommunityInfoHeroCopy">
            <span className="CommunityInfoEyebrow">
              <FaChurch /> Community details
            </span>
            <h1 className="CommunityInfoTitle">{header}</h1>
            {subheader && <p className="CommunityInfoSubtitle">{subheader}</p>}
          </div>
        </div>
      </div>

      <main className="CommunityInfoMain">
        <section className="CommunityInfoSummaryCard">
          <div className="CommunityInfoMetaItem">
            <span className="CommunityInfoMetaIcon">
              <FaChurch />
            </span>
            <span className="CommunityInfoMetaLabel">Community type</span>
            <strong className="CommunityInfoMetaValue">{type || "Not specified"}</strong>
          </div>

          <div className="CommunityInfoMetaItem">
            <span className="CommunityInfoMetaIcon">
              <FaUsers />
            </span>
            <span className="CommunityInfoMetaLabel">Members</span>
            <strong className="CommunityInfoMetaValue">
              {memberCount} member{memberCount === 1 ? "" : "s"}
            </strong>
          </div>

          <div className="CommunityInfoMetaItem">
            <span className="CommunityInfoMetaIcon">
              <FaRegClock />
            </span>
            <span className="CommunityInfoMetaLabel">Last active</span>
            <strong className="CommunityInfoMetaValue">{lastActive || "Not yet active"}</strong>
          </div>
        </section>

        <section className="CommunityInfoContentGrid">
          <article className="CommunityInfoPanel CommunityInfoAboutPanel">
            <p className="CommunityInfoPanelKicker">About this community</p>
            <h2 className="CommunityInfoPanelTitle">A little glimpse before you join</h2>
            <p className="CommunityInfoDescriptionText">
              {content || "No description has been added yet."}
            </p>
          </article>

          <aside className="CommunityInfoPanel CommunityInfoJoinPanel">
            <span className="CommunityInfoJoinIcon">
              <FaChurch />
            </span>
            <h2 className="CommunityInfoJoinTitle">Ready to walk with this group?</h2>
            <p className="CommunityInfoJoinText">
              Send a request and the community owner or leaders can review it.
            </p>
            <button
              type="button"
              className="CommunityInfoPrimaryButton"
              onClick={handleJoinClick}
              disabled={joinDisabled}
            >
              {joinButtonLabel}
            </button>
            <button
              type="button"
              className="CommunityInfoSecondaryButton"
              onClick={() => navigate(-1)}
            >
              Back to communities
            </button>
          </aside>
        </section>

        <section className="CommunityInfoPanel CommunityInfoPeople">
          <div className="CommunityInfoSectionHeader">
            <p className="CommunityInfoPanelKicker">People</p>
            <h2 className="CommunityInfoPanelTitle">Who is gathering here</h2>
          </div>

          <div className="CommunityInfoPeopleGrid">
            <div className="CommunityInfoPeopleBlock">
              <span className="CommunityInfoPeopleIcon CommunityInfoPeopleIcon--owner">
                <FaCrown />
              </span>
              <span className="CommunityInfoPeopleLabel">Owner</span>
              {owner ? (
                <span className="CommunityInfoUserTag CommunityInfoOwnerTag">
                  {formatUserLabel(owner)}
                </span>
              ) : (
                <span className="CommunityInfoEmptyText">Unknown</span>
              )}
            </div>

            <div className="CommunityInfoPeopleBlock">
              <span className="CommunityInfoPeopleIcon CommunityInfoPeopleIcon--leader">
                <FaUserShield />
              </span>
              <span className="CommunityInfoPeopleLabel">Leaders</span>
              {leaders.length === 0 ? (
                <span className="CommunityInfoEmptyText">None yet</span>
              ) : (
                <ul className="CommunityInfoUserList">
                  {displayedLeaders.map((user) => (
                    <li key={user.id || user._id || formatUserLabel(user)} className="CommunityInfoUserItem">
                      <span className="CommunityInfoUserTag CommunityInfoLeaderTag">
                        {formatUserLabel(user)}
                      </span>
                    </li>
                  ))}
                  {hasMoreLeaders && <li className="CommunityInfoUserMore">+ more leaders</li>}
                </ul>
              )}
            </div>

            <div className="CommunityInfoPeopleBlock">
              <span className="CommunityInfoPeopleIcon">
                <FaUsers />
              </span>
              <span className="CommunityInfoPeopleLabel">Members</span>
              {memberList.length === 0 ? (
                <span className="CommunityInfoEmptyText">No members yet</span>
              ) : (
                <ul className="CommunityInfoUserList">
                  {displayedMembers.map((user) => (
                    <li key={user.id || user._id || formatUserLabel(user)} className="CommunityInfoUserItem">
                      {formatUserLabel(user)}
                    </li>
                  ))}
                  {hasMoreMembers && <li className="CommunityInfoUserMore">+ more members</li>}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </section>
  );
};

export default CommunityInfo;
