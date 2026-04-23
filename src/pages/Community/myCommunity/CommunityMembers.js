import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../../../component/Footer";
import PageHeader from "../../../component/PageHeader";
import { apiFetch } from "../../../component/utils/ApiFetch";
import "./CommunityMembers.css";

const roleOrder = { Owner: 0, Leader: 1, Member: 2 };

const CommunityMembers = () => {
  const { communityId } = useParams();
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiFetch(`/community/${communityId}/members`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load members.");
      }

      setMembers(Array.isArray(data.members) ? data.members : []);
    } catch (e) {
      setError(e.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

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

  return (
    <section className="CommunityMembersPage">
      <PageHeader />
      <main className="CommunityMembersBody">
        <header className="CommunityMembersHeader">
          <div>
            <p className="CommunityMembersKicker">Community people</p>
            <h1 className="CommunityMembersTitle">Members</h1>
            <p className="CommunityMembersSub">
              View who belongs to this community. Management actions stay in the owner and leader tools.
            </p>
          </div>
          <Link className="CommunityMembersBack" to={`/community/${communityId}/my-posts`}>
            Back to posts
          </Link>
        </header>

        <section className="CommunityMembersPanel">
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

          {error && <div className="CommunityMembersError">{error}</div>}
          {loading && <p className="CommunityMembersEmpty">Loading members...</p>}

          {!loading && !error && filteredMembers.length === 0 && (
            <p className="CommunityMembersEmpty">No members match this search.</p>
          )}

          {!loading && !error && filteredMembers.length > 0 && (
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
                      <div>
                        <div className="CommunityMembersName">{member.name || member.email || "Unknown member"}</div>
                        {member.email && <div className="CommunityMembersEmail">{member.email}</div>}
                      </div>
                    </div>
                    <span className={`CommunityMembersRole ${role.toLowerCase()}`}>{role}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </section>
  );
};

export default CommunityMembers;
