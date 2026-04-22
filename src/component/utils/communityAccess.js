export const getCommunityRole = (community, userId) => {
  const currentUserId = String(userId || "");
  if (!community || !currentUserId) return null;

  const ownerId = String(community?.owner?.id || community?.owner?._id || community?.owner || "");
  if (ownerId && ownerId === currentUserId) return "Owner";

  const match = Array.isArray(community?.members)
    ? community.members.find((member) => String(member?.id || member?._id || member?.userId || "") === currentUserId)
    : null;

  return match?.role || null;
};

export const isCommunityMember = (community, userId) => Boolean(getCommunityRole(community, userId));

export const canCreateBibleStudy = (community, userId) => {
  const role = getCommunityRole(community, userId);
  return role === "Owner" || role === "Leader";
};

export const canCreateAnnouncement = (community, userId) => {
  const role = getCommunityRole(community, userId);
  return role === "Owner" || role === "Leader";
};

export const canManageMembers = (community, userId) => {
  const role = getCommunityRole(community, userId);
  if (role === "Owner") return true;
  if (role !== "Leader") return false;
  return Boolean(community?.settings?.leadersCanManageMembers);
};

export const canModerateCommunityPosts = (community, userId) => {
  const role = getCommunityRole(community, userId);
  return role === "Owner" || role === "Leader";
};
