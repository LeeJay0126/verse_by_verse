import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/ApiFetch";
import {
  canCreateBibleStudy,
  canManageMembers,
  isCommunityMember,
} from "../utils/communityAccess";

const hasRequiredAccess = ({ community, userId, mode }) => {
  if (!community || !userId) return false;
  if (mode === "manage-members") return canManageMembers(community, userId);
  if (mode === "bible-study") return canCreateBibleStudy(community, userId);
  return isCommunityMember(community, userId);
};

const getMessage = (mode) => {
  if (mode === "manage-members") {
    return "You do not have permission to manage members in this community.";
  }
  if (mode === "bible-study") {
    return "Only community leaders or the owner can access Bible Study management here.";
  }
  return "You do not have access to this community page.";
};

const RequireCommunityAccess = ({ children, mode = "member" }) => {
  const { communityId } = useParams();
  const location = useLocation();
  const { user, initializing } = useAuth();

  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState(null);
  const [error, setError] = useState("");

  const currentUserId = String(user?.id || user?._id || "");

  const fetchCommunity = useCallback(async () => {
    if (!communityId || !currentUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await apiFetch(`/community/${communityId}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load community access.");
      }

      setCommunity(data.community || null);
    } catch (e) {
      setError(e.message || "Failed to load community access.");
    } finally {
      setLoading(false);
    }
  }, [communityId, currentUserId]);

  useEffect(() => {
    if (initializing || !user) return;
    fetchCommunity();
  }, [fetchCommunity, initializing, user]);

  const allowed = useMemo(() => {
    return hasRequiredAccess({
      community,
      userId: currentUserId,
      mode,
    });
  }, [community, currentUserId, mode]);

  if (initializing) {
    return <div className="RouteGuardState">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/account" replace state={{ from: location }} />;
  }

  if (loading) {
    return <div className="RouteGuardState">Loading…</div>;
  }

  if (error) {
    return (
      <section className="RouteGuardState RouteGuardState--error">
        <p>{error}</p>
        <Link to="/community">Back to communities</Link>
      </section>
    );
  }

  if (!allowed) {
    return (
      <section className="RouteGuardState RouteGuardState--error">
        <p>{getMessage(mode)}</p>
        <Link to={communityId ? `/community/${communityId}/my-posts` : "/community"}>
          Back to community
        </Link>
      </section>
    );
  }

  return children;
};

export default RequireCommunityAccess;
