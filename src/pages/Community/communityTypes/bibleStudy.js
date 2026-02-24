const bibleStudy = {
  key: "bible_study",
  label: "📖 Bible Study",
  apiValue: "bible_study",
  className: "bible_study",
  isPoll: false,
  matches: (post) => {
    const type = String(post?.type || "").toLowerCase();
    const categoryClass = String(post?.categoryClass || "").toLowerCase();
    return type === "bible_study" || categoryClass === "bible_study";
  },
};

export default bibleStudy;