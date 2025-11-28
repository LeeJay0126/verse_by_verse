import { useRef, useEffect, useState } from "react";
import "./CommunityCard.css";

const CommunityCard = (props) => {
    const headerRef = useRef(null);
    const subheaderRef = useRef(null);
    const contentRef = useRef(null);

    const [overflow, setOverflow] = useState({
        header: false,
        subheader: false,
        content: false,
    });

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

    const { header, subheader, content, members, lastActive, role, type, my } =
        props;

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

    return (
        <section className="CommunityCards">
            <h2
                ref={headerRef}
                className={`communityCardHeader marqueeLine ${overflow.header ? "marqueeScrollable" : ""
                    }`}
            >
                <span className="marqueeInner">{header}</span>
            </h2>

            <h3
                ref={subheaderRef}
                className={`communityCardSubHeader marqueeLine ${overflow.subheader ? "marqueeScrollable" : ""
                    }`}
            >
                <span className="marqueeInner">{subheader}</span>
            </h3>

            {content ? (
                <p
                    ref={contentRef}
                    className={`communityCardContent marqueeLine ${overflow.content ? "marqueeScrollable" : ""
                        }`}
                >
                    <span className="marqueeInner">{content}</span>
                </p>
            ) : null}

            <p className="communityCardContent">
                {members} members, {lastActive}
            </p>

            {/* role + type tags */}
            <div className="communityCardTags">
                {role && <span className="communityCardRole">{role}</span>}
                {type && (
                    <span className={`communityCardType ${getTypeClass(type)}`}>
                        {type}
                    </span>
                )}
            </div>

            {/* Ternary for my community and discover community button */}
            {my ? (
                <button className="communityCardEnterButton">Enter Community</button>
            ) : (
                <button className="communityCardEnterButton">Join Community</button>
            )}
        </section>
    );
};

export default CommunityCard;
