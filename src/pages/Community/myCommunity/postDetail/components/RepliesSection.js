import { Link } from "react-router-dom";
import ReplyTree from "../replies/ReplyTree";
import Pager from "./Pager";

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
  replyMeta,
  setReplyPage,
  pageInfoText,
}) => {
  const isBibleStudy = post?.type === "bible_study";
  const rootReplies = Array.isArray(replyTree?.byParent?.get?.("root"))
    ? replyTree.byParent.get("root")
    : [];

  const pageLabel = pageInfoText?.start
    ? `Showing ${pageInfoText.start}–${pageInfoText.end} of ${replyMeta.totalRootReplies} ${isBibleStudy ? "shares" : "replies"}`
    : "";

  return (
    <section className="PostDetailReplies">
      <h2 className="PostDetailSubTitle">
        {isBibleStudy ? "Shares" : "Replies"} ( {post?.replyCount ?? 0} )
      </h2>

      {replyError && <p className="communityError smallError">{replyError}</p>}

      {isBibleStudy && (
        <div className="BibleStudyShareCtaCard">
          <div className="BibleStudyShareCtaText">
            <h3>Share your reflection</h3>
            <p>Open your guided sharing flow with the passage, leader reflection, and discussion questions.</p>
          </div>

          <Link className="BibleStudyShareCtaButton" to={`/community/${communityId}/posts/${post?.id}/share`}>
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
            <span className="PostDetailPagerMeta">{pageLabel}</span>
            <Pager page={replyMeta.page} totalPages={replyMeta.totalPages} onPageChange={setReplyPage} />
          </div>

          <ReplyTree
            rootReplies={rootReplies}
            byParent={replyTree.byParent}
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
            <Pager page={replyMeta.page} totalPages={replyMeta.totalPages} onPageChange={setReplyPage} />
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
