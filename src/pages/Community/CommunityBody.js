import { useState, useRef, useEffect } from "react";
import "./CommunityBody.css";

import { FaPlus } from "react-icons/fa6";
import { PiBookOpenLight } from "react-icons/pi";
import { LuNotebookPen } from "react-icons/lu";

const CommunityBody = () => {
    const [activeTab, setActiveTab] = useState("my");

    const myRef = useRef(null);
    const discoverRef = useRef(null);
    const underlineRef = useRef(null);

    useEffect(() => {
        const tabRef = activeTab === "my" ? myRef : discoverRef;
        const underline = underlineRef.current;

        if (tabRef.current && underline) {
            const { offsetLeft, offsetWidth } = tabRef.current;

            underline.style.width = `${offsetWidth}px`;
            underline.style.transform = `translateX(${offsetLeft}px)`;
        }
    }, [activeTab]);

    return (
        <section className="CommunityBody">
            <div className="communityBodyBC">
                <button
                    ref={myRef}
                    className={`communityBodyB ${activeTab === "my" ? "active" : ""}`}
                    onClick={() => setActiveTab("my")}
                >
                    My Communities
                </button>

                <button
                    ref={discoverRef}
                    className={`communityBodyB ${activeTab === "discover" ? "active" : ""}`}
                    onClick={() => setActiveTab("discover")}
                >
                    Discover
                </button>

                <span className="underline" ref={underlineRef} />
            </div>

            <div className="communityDisplayArea">
                {activeTab === "my" ? "My communities content…" : "Discover communities…"}
            </div>

            <section className="studyHowSection">
                <h3 className="studyHowHeader">
                    How Community Study Works
                </h3>
                <ul className="studyHowCardContainer">
                    <li className="studyCard">
                        <FaPlus className="studyCardIcon" />
                        <div>
                            <h3 className="studyCardHeader">Create or Join</h3>
                            <p className="studyCardContent">Start</p>
                        </div>
                    </li>

                    <li className="studyCard">
                        <PiBookOpenLight className="studyCardIcon" />
                        <div>
                            <h3 className="studyCardHeader">Read Together</h3>
                            <p className="studyCardContent">Walk through Scripture in sync</p>
                        </div>
                    </li>

                    <li className="studyCard">
                        <LuNotebookPen className="studyCardIcon" />
                        <div>
                            <h3 className="studyCardHeader">Share Memos</h3>
                            <p className="studyCardContent">Record insights visible to all</p>
                        </div>
                    </li>

                </ul>
            </section>
        </section>
    );
};

export default CommunityBody;
