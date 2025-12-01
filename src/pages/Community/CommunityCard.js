import { useRef, useEffect, useState } from "react";
import "./CommunityCard.css";
import { useToast } from "../../component/context/ToastContext";

const CommunityCard = (props) => {
  const headerRef = useRef(null);
  const subheaderRef = useRef(null);
  const contentRef = useRef(null);

  const [overflow, setOverflow] = useState({
    header: false,
    subheader: false,
    content: false,
  });

  const [joinStatus, setJoinStatus] = useState("idle"); // "idle" | "loading" | "requested" | "error"

  const { showToast } = useToast();

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

  async function handleJoinClick() {
    if (my) return; // already a member
    if (!id) return;
    if (joinStatus === "loading" || joinStatus === "requested") return;

    try {
      setJoinStatus("loading");

      const res = await fetch(
        `http://localhost:4000/community/${id}/request-join`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to request join");
      }

      setJoinStatus("requested");
      showToast("Join request sent to the community owner", "success");
    } catch (err) {
      console.error("[join community error]", err);
      setJoinStatus("error");
      showToast(
        err.message || "Could not send join request. Please try again.",
        "error"
      );
    }
  }

  const joinButtonLabel = my
    ? "Enter Community"
    : joinStatus === "loading"
    ? "Requesting…"
    : joinStatus === "requested"
    ? "Requested"
    : "Join Community";

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
        onClick={my ? undefined : handleJoinClick}
        disabled={
          !my && (joinStatus === "loading" || joinStatus === "requested")
        }
      >
        {joinButtonLabel}
      </button>
    </section>
  );
};

export default CommunityCard;
