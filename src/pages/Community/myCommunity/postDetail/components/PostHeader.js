import Time from "../../../../../component/utils/Time";

const PostHeader = ({ post }) => {
  const { title, body, type, createdAt, updatedAt, author } = post || {};

  const typeLabel =
    type === "questions"
      ? "Questions"
      : type === "announcements"
      ? "Announcements"
      : type === "poll"
      ? "📊 Poll"
      : "Bible Study";

  const activityText = Time(updatedAt || createdAt);

  return (
    <header className="PostDetailHeader">
      <div className="PostDetailMetaRow">
        <span className={`Tag ${type || "general"}`}>
          {type === "poll" ? "📊 Poll" : typeLabel}
        </span>
        <span className="PostDetailMetaText">
          Posted by {author || "Unknown"} · {activityText}
        </span>
      </div>

      <h1 className="PostDetailTitle">{title}</h1>

      {body && (
        <article className="PostDetailContent">
          <p>{body}</p>
        </article>
      )}
    </header>
  );
};

export default PostHeader;
