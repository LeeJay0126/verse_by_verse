import { useEffect, useMemo, useState } from "react";
import ReplyTree from "../replies/ReplyTree";
import Pager from "./Pager";

const PER_PAGE = 8;

const RepliesSection = ({
  post,
  replies,
  replyTree,
  myUserId,
  repliesLoading,
  replyError,
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
  onSubmitReply,
  onSubmitChildReply,
  replyBody,
  setReplyBody,
  replyBoxRef,
  childReplyBoxRef,
  editBoxRef,
}) => {
  const byParent = useMemo(() => {
    const m = replyTree?.byParent;
    return m instanceof Map ? m : new Map();
  }, [replyTree]);

  const rootReplies = useMemo(() => {
    const list = byParent.get("root");
    return Array.isArray(list) ? list : [];
  }, [byParent]);

  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(rootReplies.length / PER_PAGE));
  }, [rootReplies.length]);

  useEffect(() => {
    setPage(1);
  }, [rootReplies.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageReplies = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return rootReplies.slice(start, start + PER_PAGE);
  }, [rootReplies, page]);

  const pageInfoText = useMemo(() => {
    if (rootReplies.length === 0) return "";
    const start = (page - 1) * PER_PAGE + 1;
    const end = Math.min(page * PER_PAGE, rootReplies.length);
    return `Showing ${start}–${end} of ${rootReplies.length} comments`;
  }, [rootReplies.length, page]);

  return (
    <section className="PostDetailReplies">
      <h2 className="PostDetailSubTitle">
        Replies ( {post?.replyCount ?? (Array.isArray(replies) ? replies.length : 0)} )
      </h2>

      {replyError && <p className="communityError smallError">{replyError}</p>}

      {repliesLoading ? (
        <p>Loading replies…</p>
      ) : rootReplies.length === 0 ? (
        <p className="PostDetailRepliesEmpty">
          No replies yet. Be the first to respond.
        </p>
      ) : (
        <>
          <div className="PostDetailRepliesPagerTop">
            <span className="PostDetailPagerMeta">{pageInfoText}</span>
            <Pager page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>

          <ReplyTree
            rootReplies={pageReplies}
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

          <div className="PostDetailRepliesPagerBottom">
            <Pager page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <form className="PostDetailReplyForm" onSubmit={onSubmitReply}>
        <h2 className="PostDetailSubTitle">Add a reply</h2>
        <textarea
          ref={replyBoxRef}
          rows={3}
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          placeholder="Share your thoughts or encouragement…"
          disabled={replySubmitting}
          className="replyInputBox"
        />
        <button
          type="submit"
          className="NewPostPrimaryButton"
          disabled={replySubmitting || !replyBody.trim()}
        >
          {replySubmitting ? "Posting…" : "Post reply"}
        </button>
      </form>
    </section>
  );
};

export default RepliesSection;
