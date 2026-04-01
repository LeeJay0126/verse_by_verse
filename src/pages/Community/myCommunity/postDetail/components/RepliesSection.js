import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReplyTree from "../replies/ReplyTree";
import Pager from "./Pager";

const PER_PAGE = 8;

const RepliesSection = ({
  post,
  communityId,
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
  const isBibleStudy = post?.type === "bible_study";

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
    return `Showing ${start}–${end} of ${rootReplies.length} ${isBibleStudy ? "shares" : "comments"}`;
  }, [rootReplies.length, page, isBibleStudy]);

  return (
    <section className="PostDetailReplies">
      <h2 className="PostDetailSubTitle">
        {isBibleStudy ? "Shares" : "Replies"} ( {post?.replyCount ?? (Array.isArray(replies) ? replies.length : 0)} )
      </h2>

      {replyError && <p className="communityError smallError">{replyError}</p>}

      {isBibleStudy && (
        <div className="BibleStudyShareCtaCard">
          <div className="BibleStudyShareCtaText">
            <h3>Share your reflection</h3>
            <p>
              Open your guided sharing flow with the passage, leader reflection, and discussion questions.
            </p>
          </div>

          <Link
            className="BibleStudyShareCtaButton"
            to={`/community/${communityId}/posts/${post?.id}/share`}
          >
            Start my share
          </Link>
        </div>
      )}

      {repliesLoading ? (
        <p>Loading {isBibleStudy ? "shares" : "replies"}…</p>
      ) : rootReplies.length === 0 ? (
        <p className="PostDetailRepliesEmpty">
          {isBibleStudy ? "No one has shared yet. Be the first to respond." : "No replies yet. Be the first to respond."}
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

      {!isBibleStudy && (
        <form className="PostDetailReplyForm" onSubmit={onSubmitReply}>
          <h2 className="PostDetailSubTitle">Add a reply</h2>
          <textarea
            ref={replyBoxRef}
            rows={5}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            disabled={replySubmitting}
            className="replyInputBox"
            placeholder="Write your reply..."
          />
          <button
            type="submit"
            className="NewPostPrimaryButton"
            disabled={replySubmitting || !replyBody.trim()}
          >
            {replySubmitting ? "Posting…" : "Post reply"}
          </button>
        </form>
      )}
    </section>
  );
};

export default RepliesSection;