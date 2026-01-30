import PageHeader from "../../../../component/PageHeader";
import Footer from "../../../../component/Footer";
import "../MyCommunity.css";
import "./PostDetail.css";

import PostHeroHeader from "./components/PostHeroHeader";
import PostHeader from "./components/PostHeader";
import PollSection from "./components/PollSection";
import RepliesSection from "./components/RepliesSection";
import PostDetailShell from "./components/PostDetailShell";

import usePostDetailData from "./hooks/usePostDetailData";
import usePostReplies from "./hooks/usePostReplies";
import useReplyTree from "./hooks/useReplyTree";
import useThreadExpansion from "./hooks/useThreadExpansion";

const PostDetail = () => {
  const {
    communityId,
    postId,
    navigateBackUrl,
    heroStyle,
    community,
    post,
    loading,
    err,
    pollResults,
    myVotes,
    voting,
    voteError,
    handleVoteToggle,
    refetchPost,
  } = usePostDetailData();

  const {
    replies,
    myUserId,
    repliesLoading,
    replyError,
    replySubmitting,
    replyBody,
    setReplyBody,
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
    handleSaveEdit,
    handleDeleteReply,
    handleSubmitReply,
    handleSubmitChildReply,
    replyBoxRef,
    childReplyBoxRef,
    editBoxRef,
  } = usePostReplies({ communityId, postId, post, onPostChanged: refetchPost });

  const replyTree = useReplyTree(replies);

  const { expanded, toggleExpanded, deepExpanded, toggleDeepExpanded } =
    useThreadExpansion();

  if (loading) {
    return (
      <PostDetailShell heroStyle={heroStyle} PageHeader={PageHeader} Footer={Footer}>
        <section className="ForumBody">
          <p>Loading post…</p>
        </section>
      </PostDetailShell>
    );
  }

  if (err || !post) {
    return (
      <PostDetailShell heroStyle={heroStyle} PageHeader={PageHeader} Footer={Footer}>
        <section className="ForumBody">
          <p className="communityError">{err || "Post not found."}</p>
          <button
            className="NewPostSecondaryButton"
            onClick={() => window.location.assign(navigateBackUrl)}
          >
            Back to community
          </button>
        </section>
      </PostDetailShell>
    );
  }

  return (
    <section className="ForumContainer">
      <div className="ForumHero ForumHero--small" style={heroStyle}>
        <PageHeader />
        <PostHeroHeader
          communityHeader={community?.header || "Community"}
          communityId={communityId}
        />
      </div>

      <section className="ForumBody PostDetailBody">
        <PostHeader post={post} />

        {post.type === "poll" && (
          <PollSection
            poll={post.poll}
            pollResults={pollResults}
            myVotes={myVotes}
            voting={voting}
            voteError={voteError}
            onToggleVote={handleVoteToggle}
          />
        )}

        <RepliesSection
          post={post}
          replies={replies}
          replyTree={replyTree}
          myUserId={myUserId}
          repliesLoading={repliesLoading}
          replyError={replyError}
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
          onSaveEdit={handleSaveEdit}
          onDeleteReply={handleDeleteReply}
          onSubmitReply={handleSubmitReply}
          onSubmitChildReply={handleSubmitChildReply}
          replyBody={replyBody}
          setReplyBody={setReplyBody}
          replyBoxRef={replyBoxRef}
          childReplyBoxRef={childReplyBoxRef}
          editBoxRef={editBoxRef}
        />

      </section>

      <Footer />
    </section>
  );
};

export default PostDetail;
