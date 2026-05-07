import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCrown, FaRegClock, FaUserShield, FaUsers } from "react-icons/fa6";
import Footer from "../../../component/Footer";
import PageHeader from "../../../component/PageHeader";
import { apiFetch } from "../../../component/utils/ApiFetch";
import Time from "../../../component/utils/Time";
import { buildHeroStyle, DEFAULT_COMMUNITY_HERO } from "../../../component/utils/ApiConfig";
import "../browseCommunity/CommunityInfo.css";
import "./CommunityMembers.css";

const roleOrder = { Owner: 0, Leader: 1, Member: 2 };
const MAX_PREVIEW_LEADERS = 8;

const formatMemberLabel = (member) => {
  if (!member) return "Unknown";
  if (member.name) return member.name;
  if (member.fullName) return member.fullName;
  if (member.username) return member.username;
  if (member.email) return member.email;
  return "Unknown";
};

const CommunityMembers = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPageData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [communityRes, membersRes] = await Promise.all([
        apiFetch(`/community/${communityId}`),
        apiFetch(`/community/${communityId}/members`),
      ]);

      const communityData = await communityRes.json().catch(() => ({}));
      const membersData = await membersRes.json().catch(() => ({}));

      if (!communityRes.ok || !communityData.ok) {
        throw new Error(communityData.error || "Failed to load community.");
      }

      if (!membersRes.ok || !membersData.ok) {
        throw new Error(membersData.error || "Failed to load members.");
      }

      setCommunity(communityData.community || null);
      setMembers(Array.isArray(membersData.members) ? membersData.members : []);
    } catch (e) {
      setError(e.message || "Failed to load community members.");
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const filteredMembers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return members
      .filter((member) => {
        if (!needle) return true;
        return [member.name, member.email, member.role]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      })
      .sort((a, b) => {
        const roleA = roleOrder[a.role] ?? 9;
        const roleB = roleOrder[b.role] ?? 9;
        if (roleA !== roleB) return roleA - roleB;
        return String(a.name || a.email || "").localeCompare(String(b.name || b.email || ""));
      });
  }, [members, query]);

  const owner = useMemo(
    () => members.find((member) => String(member.role || "") === "Owner") || community?.owner || null,
    [community, members]
  );

  const leaders = useMemo(
    () => members.filter((member) => String(member.role || "") === "Leader"),
    [members]
  );

  const displayedLeaders = leaders.slice(0, MAX_PREVIEW_LEADERS);
  const hasMoreLeaders = leaders.length > MAX_PREVIEW_LEADERS;
  const leaderCount = leaders.length;
  const memberCount =
    typeof community?.membersCount === "number" ? community.membersCount : members.length;
  const heroStyle = {
    ...buildHeroStyle(community?.heroImageUrl, DEFAULT_COMMUNITY_HERO),
    backgroundBlendMode: "multiply",
  };
  const lastActiveLabel = Time(community?.lastActivityAt || community?.lastActive);
  const communityHomePath = `/community/${communityId}/my-posts`;

  if (loading) {
    return (
      <section className="CommunityInfo CommunityMembersPage">
        <PageHeader />
        <div className="CommunityInfoState">
          <span className="CommunityInfoStateIcon">
            <FaUsers />
          </span>
          <p>Loading community members...</p>
        </div>
        <Footer />
      </section>
    );
  }

  if (error || !community) {
    return (
      <section className="CommunityInfo CommunityMembersPage">
        <PageHeader />
        <div className="CommunityInfoState CommunityInfoState--error">
          <span className="CommunityInfoStateIcon">
            <FaUsers />
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

  return (
    <section className="CommunityInfo CommunityMembersPage">
      <div className="CommunityInfoHero" style={heroStyle}>
        <PageHeader />
        <button
          type="button"
          className="CommunityInfoBackButton"
          onClick={() => navigate(-1)}
          aria-label="Back to community posts"
        >
          <FaArrowLeft />
        </button>

        <div className="CommunityInfoHeroOverlay">
          <div className="CommunityInfoHeroCopy">
            <span className="CommunityInfoEyebrow">
              <FaUsers /> Community roster
            </span>
            <h1 className="CommunityInfoTitle">{community?.header || "Members"}</h1>
            <p className="CommunityInfoSubtitle">
              {community?.subheader || "See who is walking together in this community."}
            </p>
          </div>
        </div>
      </div>

      <main className="CommunityInfoMain CommunityMembersMain">
        <section className="CommunityInfoSummaryCard">
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
              <FaUserShield />
            </span>
            <span className="CommunityInfoMetaLabel">Leaders</span>
            <strong className="CommunityInfoMetaValue">
              {leaderCount} leader{leaderCount === 1 ? "" : "s"}
            </strong>
          </div>

          <div className="CommunityInfoMetaItem">
            <span className="CommunityInfoMetaIcon">
              <FaRegClock />
            </span>
            <span className="CommunityInfoMetaLabel">Last active</span>
            <strong className="CommunityInfoMetaValue">{lastActiveLabel || "Not yet active"}</strong>
          </div>
        </section>

        <section className="CommunityInfoContentGrid CommunityMembersContentGrid">
          <article className="CommunityInfoPanel CommunityMembersListPanel">
            <p className="CommunityInfoPanelKicker">Member directory</p>
            <h2 className="CommunityInfoPanelTitle">Everyone in this gathering</h2>
            <p className="CommunityMembersPanelText">
              Search by name, email, or role to scan the full community roster. Management actions
              still stay in the member settings workflow.
            </p>

            <div className="CommunityMembersToolbar">
              <span className="CommunityMembersCount">
                {filteredMembers.length} of {members.length} member{members.length === 1 ? "" : "s"}
              </span>
              <input
                className="CommunityMembersSearch"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members"
              />
            </div>

            {!error && filteredMembers.length === 0 && (
              <p className="CommunityMembersEmpty">No members match this search.</p>
            )}

            {!error && filteredMembers.length > 0 && (
              <ul className="CommunityMembersList">
                {filteredMembers.map((member) => {
                  const id = String(member.userId || member.id || member._id || member.email || member.name);
                  const role = String(member.role || "Member");
                  return (
                    <li className="CommunityMembersRow" key={id}>
                      <div className="CommunityMembersIdentity">
                        <span className="CommunityMembersAvatar" aria-hidden="true">
                          {String(member.name || member.email || "?").charAt(0).toUpperCase()}
                        </span>
                        <div className="CommunityMembersIdentityText">
                          <div className="CommunityMembersName">
                            {member.name || member.email || "Unknown member"}
                          </div>
                          {member.email && <div className="CommunityMembersEmail">{member.email}</div>}
                        </div>
                      </div>
                      <span className={`CommunityMembersRole ${role.toLowerCase()}`}>{role}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </article>

          <aside className="CommunityInfoPanel CommunityInfoJoinPanel CommunityMembersOverviewPanel">
            <span className="CommunityInfoJoinIcon">
              <FaUsers />
            </span>
            <h2 className="CommunityInfoJoinTitle">Keep the circle in view</h2>
            <p className="CommunityInfoJoinText">
              See who owns the space, who is leading, and hop back to the community pages when you
              are ready.
            </p>

            <div className="CommunityMembersLeadership">
              <div className="CommunityMembersLeadershipBlock">
                <span className="CommunityMembersLeadershipLabel">
                  <FaCrown /> Owner
                </span>
                <span className="CommunityInfoUserTag CommunityInfoOwnerTag">
                  {formatMemberLabel(owner)}
                </span>
              </div>

              <div className="CommunityMembersLeadershipBlock">
                <span className="CommunityMembersLeadershipLabel">
                  <FaUserShield /> Leaders
                </span>
                {displayedLeaders.length === 0 ? (
                  <span className="CommunityMembersLeadershipEmpty">No leaders yet</span>
                ) : (
                  <div className="CommunityMembersLeadershipTags">
                    {displayedLeaders.map((leader) => (
                      <span
                        key={String(leader.userId || leader.id || leader._id || leader.email || leader.name)}
                        className="CommunityInfoUserTag CommunityInfoLeaderTag"
                      >
                        {formatMemberLabel(leader)}
                      </span>
                    ))}
                    {hasMoreLeaders && (
                      <span className="CommunityMembersLeadershipMore">+ more leaders</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Link className="CommunityInfoPrimaryButton CommunityMembersActionLink" to={communityHomePath}>
              Back to posts
            </Link>
          </aside>
        </section>
      </main>

      <Footer />
    </section>
  );
};

export default CommunityMembers;
