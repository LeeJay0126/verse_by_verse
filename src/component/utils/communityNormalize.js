import Time from "./Time";

export const normalizeCommunity = (c) => {
  const membersArr = Array.isArray(c?.members) ? c.members : [];
  const membersCount =
    typeof c?.membersCount === "number"
      ? c.membersCount
      : typeof c?.members === "number"
        ? c.members
        : membersArr.length;

  const id = c?.id || c?._id;

  return {
    ...c,
    id,
    lastActivityAt: c?.lastActivityAt || c?.lastActive || c?.updatedAt || c?.createdAt,
    lastActive: Time(c?.lastActivityAt || c?.lastActive || c?.updatedAt || c?.createdAt),
    membersCount,
    membersList: membersArr,
  };
};
