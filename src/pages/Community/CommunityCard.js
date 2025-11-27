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

    return (
        <section className="CommunityCards">
            <h2
                ref={headerRef}
                className={`communityCardHeader marqueeLine ${overflow.header ? "marqueeScrollable" : ""
                    }`}
            >
                <span className="marqueeInner">{props.header}</span>
            </h2>

            <h3
                ref={subheaderRef}
                className={`communityCardSubHeader marqueeLine ${overflow.subheader ? "marqueeScrollable" : ""
                    }`}
            >
                <span className="marqueeInner">{props.subheader}</span>
            </h3>

            {props.content ? (
                <p
                    ref={contentRef}
                    className={`communityCardContent marqueeLine ${overflow.content ? "marqueeScrollable" : ""
                        }`}
                >
                    <span className="marqueeInner">{props.content}</span>
                </p>
            ) : null}

            <p className="communityCardContent">
                {props.members} members, {props.lastActive}
            </p>

            <span className="communityCardRole">{props.role}</span>

            {/*Ternary for my community and discover community button */}
            {props.my ?
                <button className="communityCardEnterButton">
                    Enter Community
                </button> :
                <button className="communityCardEnterButton">
                    Join Community
                </button>}
        </section>
    );
};

export default CommunityCard;
