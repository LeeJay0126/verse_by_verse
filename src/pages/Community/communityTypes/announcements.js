const announcements = {
  key: "announcements",
  label: "📣 Announcements",
  tagClass: "announcements",
  apiValue: "announcements",
  isPoll: false,
  matches: (post) => {
    const type = String(post?.type || "").toLowerCase();
    const category = String(post?.category || "").toLowerCase();
    return type === "announcements" || category === "announcements";
  },
};

export default announcements;
