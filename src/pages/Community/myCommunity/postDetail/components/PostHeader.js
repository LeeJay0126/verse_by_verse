import { useMemo, useState, useCallback, useEffect } from "react";
import { FiEdit3 } from "react-icons/fi"; import Time from "../../../../../component/utils/Time";
import { getTypeLabel, getTypeTagClass } from "../../../communityTypes";

const PostHeader = ({ post, canEdit = false, onSave }) => {
  const { id, title, body, type, createdAt, updatedAt, author } = post || {};

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title || "");
  const [draftBody, setDraftBody] = useState(body || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setDraftTitle(title || "");
    setDraftBody(body || "");
  }, [title, body]);

  const activityText = Time(updatedAt || createdAt);

  const openEdit = useCallback(
    (e) => {
      e?.stopPropagation?.();
      if (!canEdit) return;
      setSaveError("");
      setDraftTitle(title || "");
      setDraftBody(body || "");
      setIsEditing(true);
    },
    [canEdit, title, body]
  );

  const closeEdit = useCallback(() => {
    if (saving) return;
    setSaveError("");
    setIsEditing(false);
    setDraftTitle(title || "");
    setDraftBody(body || "");
  }, [saving, title, body]);

  const canSubmit = useMemo(() => {
    const t = String(draftTitle || "").trim();
    if (!t) return false;

    if (type !== "poll") {
      const b = String(draftBody || "").trim();
      if (!b) return false;
    }
    return true;
  }, [draftTitle, draftBody, type]);

  const handleSave = useCallback(async () => {
    if (!canEdit || typeof onSave !== "function" || !id) return;
    if (!canSubmit) return;

    setSaving(true);
    setSaveError("");

    try {
      const payload = {
        title: String(draftTitle || "").trim(),
        body: draftBody ?? "",
        type: type || "general",
      };

      const res = await onSave(payload);

      if (!res?.ok) {
        throw new Error(res?.error || "Failed to save.");
      }

      setIsEditing(false);
    } catch (e) {
      setSaveError(e?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }, [canEdit, onSave, id, canSubmit, draftTitle, draftBody, type]);

  const onKeyDown = (e) => {
    if (!isEditing) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeEdit();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <header className="PostDetailHeader" onKeyDown={onKeyDown}>
      <div className="PostDetailMetaRow">
        <span className={`Tag ${getTypeTagClass(post)}`}>
          {getTypeLabel(post)}
        </span>
        <span className="PostDetailMetaText">
          Posted by {author || "Unknown"} · {activityText}
        </span>
      </div>

      <div
        className={[
          "PostDetailEditableGroup",
          canEdit ? "can-edit" : "",
          isEditing ? "is-editing" : "",
        ].join(" ")}
      >
        {!isEditing ? (
          <>
            <h1 className="PostDetailTitle">{title}</h1>

            {body && (
              <article className="PostDetailContent">
                <p>{body}</p>
              </article>
            )}

            {canEdit && (
              <button
                type="button"
                className="PostDetailEditIcon"
                aria-label="Edit post"
                title="Edit"
                onClick={openEdit}
              >
                <FiEdit3 size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="PostDetailEditPanel" onClick={(e) => e.stopPropagation()}>
            {saveError && <div className="PostDetailEditError">{saveError}</div>}

            <div className="PostDetailEditField">
              <label>Title</label>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                disabled={saving}
                placeholder="Post title"
              />
            </div>

            <div className="PostDetailEditField">
              <label>Body</label>
              <textarea
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                disabled={saving || type === "poll"}
                placeholder={type === "poll" ? "Poll posts don’t require body." : "Write your post..."}
              />
            </div>

            <div className="PostDetailEditActions">
              <button
                type="button"
                className="PostDetailEditSecondary"
                onClick={closeEdit}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="PostDetailEditPrimary"
                onClick={handleSave}
                disabled={saving || !canSubmit}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>

            <div className="PostDetailEditHint">Press Esc to cancel · Ctrl/⌘ + Enter to save</div>
          </div>
        )}
      </div>
    </header>
  );
};

export default PostHeader;