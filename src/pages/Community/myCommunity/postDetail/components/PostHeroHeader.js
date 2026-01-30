import { Link } from "react-router-dom";

const PostHeroHeader = ({ communityHeader, communityId }) => {
  return (
    <div className="ForumHeaderContainer">
      <h1 className="ForumHeader">{communityHeader}</h1>
      <h2 className="ForumSubHeader">
        <Link
          to={`/community/${communityId}/my-posts`}
          className="PostDetailBreadcrumb"
        >
          Back to posts
        </Link>
      </h2>
    </div>
  );
};

export default PostHeroHeader;
