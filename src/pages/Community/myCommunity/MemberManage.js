import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageHeader from "../../../component/PageHeader";
import Footer from "../../../component/Footer";
import { useAuth } from "../../../component/context/AuthContext";
import { apiFetch } from "../../../component/utils/ApiFetch";
import "./MemberManage.css";

export default function MemberManage() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [activeTab, setActiveTab] = useState("requests");

  const [inviteInput, setInviteInput] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  const currentId = String(user?.id || user?._id || "");
  const communityHomePath = `/community/${communityId}/my-posts`;

  const leadersCanManageMembers = Boolean(community?.settings?.leadersCanManageMembers);

  const isOwner = useMemo(() => {
    const ownerId = String(community?.owner?.id || community?.owner?._id || "");
    return ownerId && ownerId === currentId;
  }, [community, currentId]);

  const isLeader = useMemo(() => {
    return (
      Array.isArray(community?.members) &&
      community.members.some(
        (m) =>
          (String(m.role || "").toLowerCase() === "leader" ||
            String(m.role || "").toLowerCase() === "owner") &&
          String(m.id || m._id || m.userId || "") === currentId
      )
    );
  }, [community, currentId]);

  const canManage = useMemo(() => {
    return isOwner || (isLeader && leadersCanManageMembers);
  }, [isOwner, isLeader, leadersCanManageMembers]);

  const fetchCommunityOnly = useCallback(async () => {
    const res = await apiFetch(`/community/${communityId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load community.");
    return data.community || null;
  }, [communityId]);

  const fetchMembersOnly = useCallback(async () => {
    const res = await apiFetch(`/community/${communityId}/members`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load members.");
    return Array.isArray(data.members) ? data.members : [];
  }, [communityId]);

  const fetchRequestsOnly = useCallback(async () => {
    const res = await apiFetch(`/community/${communityId}/join-requests`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load join requests.");
    return Array.isArray(data.requests) ? data.requests : [];
  }, [communityId]);

  const fetchAll = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);

      const c = await fetchCommunityOnly();
      setCommunity(c);

      const ownerId = String(c?.owner?.id || c?.owner?._id || "");
      const isOwnerNow = ownerId && ownerId === currentId;

      const leadersAllowed = Boolean(c?.settings?.leadersCanManageMembers);
      const isLeaderNow =
        Array.isArray(c?.members) &&
        c.members.some(
          (m) =>
            (String(m.role || "").toLowerCase() === "leader" ||
              String(m.role || "").toLowerCase() === "owner") &&
            String(m.id || m._id || m.userId || "") === currentId
        );

      const canManageNow = isOwnerNow || (isLeaderNow && leadersAllowed);

      if (!canManageNow) {
        setMembers([]);
        setRequests([]);
        navigate(communityHomePath, { replace: true });
        return;
      }

      const [m, r] = await Promise.all([fetchMembersOnly(), fetchRequestsOnly()]);
      setMembers(m);
      setRequests(r);
    } catch (e) {
      setErr(e.message || "Failed to load member management.");
    } finally {
      setLoading(false);
    }
  }, [
    communityId,
    currentId,
    navigate,
    communityHomePath,
    fetchCommunityOnly,
    fetchMembersOnly,
    fetchRequestsOnly,
  ]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!canManage) return;
    if (activeTab === "invite" && !(isOwner || (isLeader && leadersCanManageMembers))) {
      setActiveTab("requests");
    }
  }, [activeTab, canManage, isOwner, isLeader, leadersCanManageMembers]);

  const toggleLeadersRule = async () => {
    if (!isOwner) return;

    try {
      setErr("");
      const res = await apiFetch(`/community/${communityId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadersCanManageMembers: !leadersCanManageMembers,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to update setting.");

      setCommunity((prev) => data.community || prev);
    } catch (e) {
      setErr(e.message || "Failed to update setting.");
    }
  };

  const acceptRequest = async (requestUserId) => {
    try {
      setErr("");
      const res = await apiFetch(
        `/community/${communityId}/join-requests/${requestUserId}/accept`,
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to accept request.");
      await fetchAll();
    } catch (e) {
      setErr(e.message || "Failed to accept request.");
    }
  };

  const rejectRequest = async (requestUserId) => {
    try {
      setErr("");
      const res = await apiFetch(
        `/community/${communityId}/join-requests/${requestUserId}/reject`,
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to reject request.");
      await fetchAll();
    } catch (e) {
      setErr(e.message || "Failed to reject request.");
    }
  };

  const expelMember = async (memberUserId) => {
    const ok = window.confirm("Expel this member? They will be removed from the community.");
    if (!ok) return;

    try {
      setErr("");
      const res = await apiFetch(`/community/${communityId}/members/${memberUserId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to expel member.");
      await fetchAll();
    } catch (e) {
      setErr(e.message || "Failed to expel member.");
    }
  };

  const promoteToLeader = async (memberUserId) => {
    if (!isOwner) return;
    try {
      setErr("");
      const res = await apiFetch(`/community/${communityId}/members/${memberUserId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "Leader" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to promote.");
      await fetchAll();
    } catch (e) {
      setErr(e.message || "Failed to promote.");
    }
  };

  const demoteToMember = async (memberUserId) => {
    if (!isOwner) return;
    try {
      setErr("");
      const res = await apiFetch(`/community/${communityId}/members/${memberUserId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "Member" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to demote.");
      await fetchAll();
    } catch (e) {
      setErr(e.message || "Failed to demote.");
    }
  };

  const canSeeInviteTab = isOwner || (isLeader && leadersCanManageMembers);

  const sendInvite = async () => {
    if (!canSeeInviteTab) return;

    const identifier = String(inviteInput || "").trim();
    if (!identifier) return;

    try {
      setErr("");
      setInviteMsg("");
      setInviteSending(true);

      const res = await apiFetch(`/community/${communityId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to send invitation.");

      setInviteInput("");
      setInviteMsg("Invitation sent.");
    } catch (e) {
      setErr(e.message || "Failed to send invitation.");
    } finally {
      setInviteSending(false);
    }
  };

  const onInviteKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!inviteSending) sendInvite();
    }
  };

  if (loading) {
    return (
      <section className="MemberManagePage">
        <PageHeader />
        <div className="MemberManageBody">Loading…</div>
        <Footer />
      </section>
    );
  }

  return (
    <section className="MemberManagePage">
      <PageHeader />

      <div className="MemberManageBody">
        <div className="MemberManageHeader">
          <div className="MemberManageHeaderLeft">
            <h1 className="MemberManageTitle">Manage Members</h1>
            <p className="MemberManageSub">
              <Link to={communityHomePath} className="MemberManageBack">
                ← Back to community
              </Link>
            </p>
          </div>

          {isOwner && (
            <div className="MemberManageToggle">
              <div className="ToggleLabel">Allow leaders to accept/expel & invite</div>
              <button
                type="button"
                className={`ToggleBtn ${leadersCanManageMembers ? "on" : "off"}`}
                onClick={toggleLeadersRule}
              >
                {leadersCanManageMembers ? "On" : "Off"}
              </button>
            </div>
          )}
        </div>

        <div className="MemberManageTabsRow">
          <div className="MemberManageTabs">
            <button
              type="button"
              className={`TabBtn ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              Join Requests <span className="TabCount">{requests.length}</span>
            </button>

            <button
              type="button"
              className={`TabBtn ${activeTab === "members" ? "active" : ""}`}
              onClick={() => setActiveTab("members")}
            >
              Members <span className="TabCount">{members.length}</span>
            </button>

            {canSeeInviteTab && (
              <button
                type="button"
                className={`TabBtn ${activeTab === "invite" ? "active" : ""}`}
                onClick={() => setActiveTab("invite")}
              >
                Invitations
              </button>
            )}
          </div>
        </div>

        {err && <div className="MemberManageError">{err}</div>}
        {inviteMsg && <div className="MemberManageSuccess">{inviteMsg}</div>}

        {activeTab === "invite" && canSeeInviteTab && (
          <div className="Panel">
            <div className="PanelHeader">
              <h2>Send Invitation</h2>
            </div>

            <div className="InviteForm">
              <div className="InviteHint">Enter a username or email address.</div>

              <div className="InviteRow">
                <input
                  className="InviteInput"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={onInviteKeyDown}
                  placeholder="username or email"
                  disabled={inviteSending}
                />
                <button
                  type="button"
                  className="Btn primary"
                  onClick={sendInvite}
                  disabled={inviteSending || !String(inviteInput || "").trim()}
                >
                  {inviteSending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "invite" && (
          <div className="MemberManageGrid">
            <div className="Panel">
              <div className="PanelHeader">
                <h2>Join Requests</h2>
                <span className="CountPill">{requests.length}</span>
              </div>

              {requests.length === 0 ? (
                <p className="EmptyText">No pending requests.</p>
              ) : (
                <ul className="List">
                  {requests.map((r) => {
                    const uid = String(r.userId || r.id || r._id || "");
                    return (
                      <li key={uid} className="ListRow">
                        <div className="RowMain">
                          <div className="RowTitle">{r.name || r.email || uid}</div>
                          <div className="RowSub">{r.email || ""}</div>
                        </div>

                        <div className="RowActions">
                          <button className="Btn" onClick={() => acceptRequest(uid)}>
                            Accept
                          </button>
                          <button className="Btn danger" onClick={() => rejectRequest(uid)}>
                            Reject
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="Panel">
              <div className="PanelHeader">
                <h2>Members</h2>
                <span className="CountPill">{members.length}</span>
              </div>

              {members.length === 0 ? (
                <p className="EmptyText">No members found.</p>
              ) : (
                <ul className="List">
                  {members.map((m) => {
                    const uid = String(m.userId || m.id || m._id || "");
                    const role = String(m.role || "Member");
                    const isSelf = uid === currentId;
                    const isOwnerRow = role.toLowerCase() === "owner";

                    return (
                      <li key={uid} className="ListRow">
                        <div className="RowMain">
                          <div className="RowTitle">
                            {m.name || m.email || uid}{" "}
                            <span className={`RolePill ${role.toLowerCase()}`}>{role}</span>
                          </div>
                          <div className="RowSub">{m.email || ""}</div>
                        </div>

                        <div className="RowActions">
                          {isOwner && !isOwnerRow && (
                            <>
                              {role.toLowerCase() !== "leader" ? (
                                <button className="Btn" onClick={() => promoteToLeader(uid)}>
                                  Promote
                                </button>
                              ) : (
                                <button className="Btn" onClick={() => demoteToMember(uid)}>
                                  Demote
                                </button>
                              )}
                            </>
                          )}

                          {!isOwnerRow && !isSelf && (
                            <button className="Btn danger" onClick={() => expelMember(uid)}>
                              Expel
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </section>
  );
}