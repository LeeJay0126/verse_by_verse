export const COMMUNITY_ACTIVITY_EVENT = "communityActivityUpdated";

export const emitCommunityActivityUpdated = () => {
  window.dispatchEvent(new Event(COMMUNITY_ACTIVITY_EVENT));
};
