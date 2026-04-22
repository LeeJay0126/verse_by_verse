export const RESEND_COOLDOWN_MS = 60 * 1000;
export const VERIFICATION_LINK_TTL_MINUTES = 5;

const cooldownKey = (email) => `versebyverse:verify-resend:${String(email || "").trim().toLowerCase()}`;

export const readCooldownUntil = (email) => {
  if (typeof window === "undefined") return 0;
  const raw = window.sessionStorage.getItem(cooldownKey(email));
  const value = Number(raw || 0);
  return Number.isFinite(value) ? value : 0;
};

export const writeCooldownUntil = (email, until) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(cooldownKey(email), String(until));
};

export const clearCooldownUntil = (email) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(cooldownKey(email));
};

export const getRemainingSeconds = (cooldownUntil) => {
  if (!cooldownUntil) return 0;
  return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
};

export const formatCooldown = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const remainingSeconds = safe % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};
