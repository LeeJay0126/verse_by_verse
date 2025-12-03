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
  }, []);

  const getTypeClass = (type) => {
    switch (type) {
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

  const handleEnterClick = () => {
    if (!id) return;

    if (my) {
      // TODO: this will be your "member community main page" later
      navigate(`/community/${id}`);
    } else {
      // Non-member → community info page
      navigate(`/community/${id}/info`, {
        state: {
          community: {
            id,
            header,
            subheader,
            content,
            members,
            lastActive,
            role,
            type,
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

      <p className="communityCardContent">
        {members} members, {lastActive}
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
        onClick={handleEnterClick}
      >
        Enter Community
      </button>
    </section>
  );
};

export default CommunityCard;
