import { useRef, useEffect, useState } from "react";
import "./CommunityCard.css";
import { useNavigate } from "react-router-dom";

const CommunityCard = (props) => {
  const headerRef = useRef(null);
  const subheaderRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  const [overflow, setOverflow] = useState({
    header: false,
    subheader: false,
    content: false,
  });

  const {
    id,
    header,
    subheader,
    content,
    members,
    membersCount,
    membersList,
    lastActive,
    role,
    type,
    my,
  } = props;

  useEffect(() => {
    const isOverflowing = (el) => {
      if (!el) return false;
      return el.scrollWidth > el.clientWidth;
    };

    const checkOverflow = () => {
      setOverflow({
        header: isOverflowing(headerRef.current),
        subheader: isOverflowing(subheaderRef.current),
        content: isOverflowing(contentRef.current),
      });
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [header, subheader, content]);

  const getTypeClass = (t) => {
    switch (t) {
      case "Bible Study":
        return "type-bible-study";
      case "Read Through":
        return "type-read-through";
      case "Church Organization":
        return "type-church-org";
      case "Prayer Group":
        return "type-prayer-group";
      default:
        return "type-other";
    }
  };

  const memberCount =
    typeof membersCount === "number"
      ? membersCount
      : typeof members === "number"
        ? members
        : Array.isArray(membersList)
          ? membersList.length
          : Array.isArray(members)
            ? members.length
            : 0;

  const handlePrimaryClick = () => {
    if (!id) return;

    if (my) {
      navigate(`/community/${id}/my-posts`);
    } else {
      navigate(`/community/${id}/info`, {
        state: {
          community: {
            id,
            header,
            subheader,
            content,
            membersCount: memberCount,
            lastActive,
            role,
            type,
            my: false,
          },
        },
      });
    }
  };

  return (
    <section className="CommunityCards">
      <h2
        ref={headerRef}
        className={`communityCardHeader marqueeLine ${
          overflow.header ? "marqueeScrollable" : ""
        }`}
      >
        <span className="marqueeInner">{header}</span>
      </h2>

      <h3
        ref={subheaderRef}
        className={`communityCardSubHeader marqueeLine ${
          overflow.subheader ? "marqueeScrollable" : ""
        }`}
      >
        <span className="marqueeInner">{subheader}</span>
      </h3>

      {content ? (
        <p
          ref={contentRef}
          className={`communityCardContent marqueeLine ${
            overflow.content ? "marqueeScrollable" : ""
          }`}
        >
          <span className="marqueeInner">{content}</span>
        </p>
      ) : null}

      <p className="communityCardMeta">
        {memberCount} member{memberCount === 1 ? "" : "s"}
        {lastActive ? `, ${lastActive}` : ""}
      </p>

      <div className="communityCardTags">
        {role && <span className="communityCardRole">{role}</span>}
        {type && (
          <span className={`communityCardType ${getTypeClass(type)}`}>
            {type}
          </span>
        )}
      </div>

      <button
        className="communityCardEnterButton"
        type="button"
        onClick={handlePrimaryClick}
      >
        {my ? "Enter Community" : "Join Community"}
      </button>
    </section>
  );
};

export default CommunityCard;
