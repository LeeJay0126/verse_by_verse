const bibleStudy = {
  key: "general",
  label: "📖 Bible Study",
  tagClass: "general",
  apiValue: "general",
  isPoll: false,
  matches: (post) => {
    const type = String(post?.type || "").toLowerCase();
    const category = String(post?.category || "").toLowerCase();
    return type === "general" || category === "general";
  },
};

export default bibleStudy;
