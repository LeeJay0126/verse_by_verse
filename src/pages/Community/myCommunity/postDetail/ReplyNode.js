import Time from "../../../../component/utils/Time";

const MAX_DEPTH = 12;
const VISUAL_MAX_DEPTH = 6;
const MAX_REPLY_DEPTH = 2;
const MAX_CHILDREN_RENDER = 4;

const ReplyNode = ({
  reply,
  depth,
  ancestorHasNext = [],
  isLast = true,
  byParent,
  myUserId,
  replySubmitting,
  expanded,
  toggleExpanded,
  deepExpanded,
  toggleDeepExpanded,
  activeReplyTo,
  setActiveReplyTo,
  childBody,
  setChildBody,
  editingReplyId,
  editBody,
  setEditBody,
  editSubmitting,
  startEditReply,
  cancelEditReply,
  onSaveEdit,
  onDeleteReply,
  onSubmitChildReply,
  childReplyBoxRef,
  editBoxRef,
}) => {
  const id = String(reply.id);
  const children = byParent.get(id) || [];
  const isExpanded = expanded.has(id);

  const clampedDepth = Math.min(depth, MAX_DEPTH);
  const visualDepth = Math.min(clampedDepth, VISUAL_MAX_DEPTH);

  const canReplyHere = clampedDepth < MAX_REPLY_DEPTH;

  const isTooDeep = clampedDepth >= VISUAL_MAX_DEPTH;
  const isDeepOpen = deepExpanded.has(id);

  const hasNextSibling = !isLast;
  const elbowContinue = hasNextSibling;

  const cols = [];
  if (visualDepth > 0) {
    const ancestorColsCount = visualDepth - 1;

    for (let i = 0; i < ancestorColsCount; i++) {
      cols.push(
        <span
          key={`col-${id}-${i}`}
          className={`ThreadCol ${ancestorHasNext[i] ? "on" : "off"}`}
          style={{ "--i": i }}
          aria-hidden="true"
        />
      );
    }

    cols.push(
      <span
        key={`elbow-${id}`}
        className={`ThreadElbow ${elbowContinue ? "continue" : "stop"}`}
        style={{ "--i": visualDepth - 1 }}
        aria-hidden="true"
      />
    );
  }

  const showChildren =
    isExpanded && children.length > 0 && (!isTooDeep || isDeepOpen);

  const visibleChildren = children.slice(0, MAX_CHILDREN_RENDER);

  const isOwner =
    myUserId && reply.authorId && String(reply.authorId) === String(myUserId);

  const isEditing = editingReplyId === id;

  return (
    <li
      id={`reply-${id}`}
      className="PostDetailReplyItem"
      style={{ "--depth": visualDepth }}
    >
      <div className="ThreadRow">
        <div className="ThreadGutter" aria-hidden="true">
          {cols}
        </div>

        <div className="ThreadContent">
          <div className="PostDetailReplyHeader">
            <div className="replyActionsRow">
              <span className="PostDetailReplyAuthor">
                {reply.author || "Unknown"}
              </span>
              {clampedDepth > visualDepth && (
                <span className="ThreadDepthCapDot" aria-hidden="true" />
              )}
            </div>
            <span className="PostDetailReplyTime">
              {Time(reply.updatedAt || reply.createdAt)}
              {reply.updatedAt ? " (edited)" : ""}
            </span>
          </div>

          {!isEditing ? (
            <p className="PostDetailReplyBody">{reply.body}</p>
          ) : (
            <form
              className="PostDetailInlineEditForm"
              onSubmit={(e) => {
                e.preventDefault();
                onSaveEdit(id);
              }}
            >
              <textarea
                ref={editBoxRef}
                rows={2}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                disabled={editSubmitting}
                className="replyInputBox"
              />
              <div className="PostDetailInlineReplyActions">
                <button
                  type="button"
                  className="NewPostSecondaryButton"
                  onClick={cancelEditReply}
                  disabled={editSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="NewPostPrimaryButton"
                  disabled={editSubmitting || !editBody.trim()}
                >
                  {editSubmitting ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          )}

          <div className="PostDetailReplyActionsRow">
            <div className="replyActionsRow">
              {!isEditing && canReplyHere ? (
                <button
                  type="button"
                  className="ReplyActionBtn"
                  onClick={() => {
                    setActiveReplyTo(id);
                    setChildBody("");
                    if (!isExpanded) toggleExpanded(id);
                    requestAnimationFrame(() => childReplyBoxRef.current?.focus());
                  }}
                  disabled={replySubmitting || editSubmitting}
                >
                  Reply
                </button>
              ) : !isEditing ? (
                <span className="ReplyDepthLimitText">Reply depth limit reached</span>
              ) : null}

              {children.length > 0 && (
                <button
                  type="button"
                  className="ReplyActionBtn"
                  onClick={() => toggleExpanded(id)}
                  disabled={replySubmitting || editSubmitting}
                >
                  {isExpanded ? "Hide replies" : `View replies (${children.length})`}
                </button>
              )}
            </div>

            <div className="replyActionsRow">
              {!isEditing && isOwner && (
                <>
                  <button
                    type="button"
                    className="ReplyActionBtn ReplyActionBtn--muted"
                    onClick={() => startEditReply(reply)}
                    disabled={replySubmitting || editSubmitting}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ReplyActionBtn ReplyActionBtn--danger"
                    onClick={() => onDeleteReply(id)}
                    disabled={replySubmitting || editSubmitting}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {isExpanded && children.length > 0 && isTooDeep && !isDeepOpen && (
              <button
                type="button"
                className="ReplyActionBtn ReplyActionBtn--deep"
                onClick={() => toggleDeepExpanded(id)}
                disabled={replySubmitting || editSubmitting}
              >
                Continue this thread
              </button>
            )}

            {isExpanded && children.length > 0 && isTooDeep && isDeepOpen && (
              <button
                type="button"
                className="ReplyActionBtn ReplyActionBtn--deep"
                onClick={() => toggleDeepExpanded(id)}
                disabled={replySubmitting || editSubmitting}
              >
                Collapse deep thread
              </button>
            )}
          </div>

          {activeReplyTo === id && canReplyHere && !isEditing && (
            <form className="PostDetailInlineReplyForm" onSubmit={onSubmitChildReply}>
              <textarea
                ref={childReplyBoxRef}
                rows={2}
                value={childBody}
                onChange={(e) => setChildBody(e.target.value)}
                placeholder="Write a reply…"
                disabled={replySubmitting}
                className="replyInputBox"
              />
              <div className="PostDetailInlineReplyActions">
                <button
                  type="button"
                  className="NewPostSecondaryButton"
                  onClick={() => {
                    setActiveReplyTo(null);
                    setChildBody("");
                  }}
                  disabled={replySubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="NewPostPrimaryButton"
                  disabled={replySubmitting || !childBody.trim()}
                >
                  {replySubmitting ? "Posting…" : "Post"}
                </button>
              </div>
            </form>
          )}

          {isExpanded && children.length > 0 && isTooDeep && !isDeepOpen && (
            <div className="DeepThreadPreview">
              <button
                type="button"
                className="DeepThreadBtn"
                onClick={() => toggleDeepExpanded(id)}
                disabled={replySubmitting || editSubmitting}
              >
                Continue this thread ({children.length})
              </button>
            </div>
          )}

          {showChildren && (
            <ol className="PostDetailRepliesChildren">
              {visibleChildren.map((c, idx) => {
                const childIsLast = idx === visibleChildren.length - 1;
                const nextAncestorHasNext = [
                  ...ancestorHasNext.slice(0, Math.max(0, visualDepth - 1)),
                  hasNextSibling,
                ];

                return (
                  <ReplyNode
                    key={String(c.id)}
                    reply={c}
                    depth={clampedDepth + 1}
                    ancestorHasNext={nextAncestorHasNext}
                    isLast={childIsLast}
                    byParent={byParent}
                    myUserId={myUserId}
                    replySubmitting={replySubmitting}
                    expanded={expanded}
                    toggleExpanded={toggleExpanded}
                    deepExpanded={deepExpanded}
                    toggleDeepExpanded={toggleDeepExpanded}
                    activeReplyTo={activeReplyTo}
                    setActiveReplyTo={setActiveReplyTo}
                    childBody={childBody}
                    setChildBody={setChildBody}
                    editingReplyId={editingReplyId}
                    editBody={editBody}
                    setEditBody={setEditBody}
                    editSubmitting={editSubmitting}
                    startEditReply={startEditReply}
                    cancelEditReply={cancelEditReply}
                    onSaveEdit={onSaveEdit}
                    onDeleteReply={onDeleteReply}
                    onSubmitChildReply={onSubmitChildReply}
                    childReplyBoxRef={childReplyBoxRef}
                    editBoxRef={editBoxRef}
                  />
                );
              })}

              {children.length > MAX_CHILDREN_RENDER && (
                <li className="PostDetailRepliesMore">
                  <span className="PostDetailRepliesMoreText">
                    Showing {MAX_CHILDREN_RENDER} of {children.length} replies
                  </span>
                </li>
              )}
            </ol>
          )}
        </div>
      </div>
    </li>
  );
};

export default ReplyNode;
