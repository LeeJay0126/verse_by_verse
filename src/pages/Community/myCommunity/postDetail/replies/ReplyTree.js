import ReplyNode from "../ReplyNode";

const ReplyTree = ({
  rootReplies,
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
  const list = Array.isArray(rootReplies) ? rootReplies : [];
  const map = byParent instanceof Map ? byParent : new Map();

  return (
    <ol className="PostDetailRepliesList">
      {list.map((r, idx) => (
        <ReplyNode
          key={String(r.id)}
          reply={r}
          depth={0}
          ancestorHasNext={[]}
          isLast={idx === list.length - 1}
          byParent={map}
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
      ))}
    </ol>
  );
};

export default ReplyTree;
