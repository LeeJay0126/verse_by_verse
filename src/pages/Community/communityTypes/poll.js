const poll = {
  key: "poll",
  label: "📊 Poll",
  tagClass: "poll",
  apiValue: "poll",
  isPoll: true,
  matches: (post) => {
    const type = String(post?.type || "").toLowerCase();
    const category = String(post?.category || "").toLowerCase();
    return type === "poll" || category === "poll";
  },
};

export default poll;
