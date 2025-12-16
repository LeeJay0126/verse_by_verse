const Time = (iso) => {
  if (!iso) return "Recently active";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently active";

  const now = new Date();
  const diffMs = now - date;

  if (diffMs <= 0) return "Just now"; // handles future-ish timestamps

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

export default Time;
