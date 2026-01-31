const question = {
  key: "questions",
  label: "❓ Questions",
  tagClass: "questions",
  apiValue: "questions",
  isPoll: false,
  matches: (post) => {
    const type = String(post?.type || "").toLowerCase();
    const category = String(post?.category || "").toLowerCase();
    return type === "questions" || category === "questions";
  },
};

export default question;
