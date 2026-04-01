import { useMemo } from "react";
import { FiEdit3 } from "react-icons/fi";
import Time from "../../../../../component/utils/Time";
import { getTypeLabel, getTypeTagClass } from "../../../communityTypes";

const PostHeader = ({ post, canEdit = false, onEdit }) => {
  const { title, body, createdAt, updatedAt, author } = post || {};

  const activityText = Time(updatedAt || createdAt);

  const bodyParagraphs = useMemo(() => {
    return String(body || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [body]);

  return (
    <header className="PostDetailHeader">
      <div className="PostDetailMetaRow">
        <span className={`Tag ${getTypeTagClass(post)}`}>
          {getTypeLabel(post)}
        </span>
        <span className="PostDetailMetaText">
          Posted by {author || "Unknown"} · {activityText}
        </span>
      </div>

      <div className={["PostDetailEditableGroup", canEdit ? "can-edit" : ""].join(" ")}>
        <div className="PostDetailHeaderTopRow">
          <h1 className="PostDetailTitle">{title}</h1>

          {canEdit && (
            <button
              type="button"
              className="PostDetailEditIcon"
              aria-label="Edit post"
              title="Edit"
              onClick={onEdit}
            >
              <FiEdit3 size={16} />
            </button>
          )}
        </div>

        {!!bodyParagraphs.length && (
          <article className="PostDetailContent">
            {bodyParagraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph}`}>{paragraph}</p>
            ))}
          </article>
        )}
      </div>
    </header>
  );
};

export default PostHeader;