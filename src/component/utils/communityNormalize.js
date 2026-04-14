import { normalizeCommunity as sharedNormalizeCommunity } from "@verse/shared";
import Time from "./Time";

export const normalizeCommunity = (community) =>
  sharedNormalizeCommunity(community, { formatRelativeTime: Time });
