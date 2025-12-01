// src/pages/CommunityWalkthrough.jsx
import PageHeader from "../../component/PageHeader";
import "./CommunityWalkthrough.css";
import { useNavigate } from "react-router-dom";

const CommunityWalkthrough = () => {
    const navigate = useNavigate();

    const handleLogin = () => navigate("/account");
    const handleSignup = () => navigate("/signup");

    return (
        <div className="communityWalkthrough">
            {/* HERO */}
            <header className="communityWalkthroughHero">
                <PageHeader />
                <div className="communityWalkthroughHeroOverlay">
                    <p className="communityWalkthroughHeroEyebrow">
                        Verse by Verse Communities
                    </p>
                    <h1 className="communityWalkthroughHeroTitle">
                        Walk through our community features
                    </h1>
                    <p className="communityWalkthroughHeroSubtitle">
                        Log in, discover groups, or create your own Bible study community.
                    </p>
                </div>
            </header>

            {/* BODY */}
            <main className="communityWalkthroughBody">
                <section className="communityWalkthroughIntro">
                    <h2>How it works</h2>
                    <p>
                        Follow these simple steps to start joining or creating communities
                        inside Verse by Verse.
                    </p>
                </section>

                <ol className="communityWalkthroughSteps">
                    <li className="communityWalkthroughStepCard">
                        <div className="communityWalkthroughStepNumber">1</div>
                        <div className="communityWalkthroughStepContent">
                            <h3>Log in to your account</h3>
                            <p>
                                First, sign in so we can connect you with your communities and
                                save your progress.
                            </p>
                        </div>
                    </li>

                    <li className="communityWalkthroughStepCard">
                        <div className="communityWalkthroughStepNumber">2</div>
                        <div className="communityWalkthroughStepContent">
                            <h3>Open the Community tab</h3>
                            <p>
                                From the main menu, tap <b>“Community”</b> to access all groups
                                available to you.
                            </p>
                        </div>
                    </li>

                    <li className="communityWalkthroughStepCard">
                        <div className="communityWalkthroughStepNumber">3</div>
                        <div className="communityWalkthroughStepContent">
                            <h3>Create or join a community</h3>
                            <p>
                                Tap <b>“Create community”</b> to start your own group, or{" "}
                                <b>“Browse community”</b> to find an existing one to join.
                            </p>
                        </div>
                    </li>

                    <li className="communityWalkthroughStepCard">
                        <div className="communityWalkthroughStepNumber">4</div>
                        <div className="communityWalkthroughStepContent">
                            <h3>Share, study, and organize</h3>
                            <p>
                                Post study notes, plan reading schedules, and organize your own
                                community’s discussions — all in one place.
                            </p>
                        </div>
                    </li>
                </ol>
            </main>

            {/* FOOTER CALL-TO-ACTION */}
            <footer className="communityWalkthroughFooter">
                <p className="communityWalkthroughFooterText">
                    Ready to get started?
                </p>
                <div className="communityWalkthroughFooterButtons">
                    <button
                        type="button"
                        className="communityWalkthroughBtnSecondary"
                        onClick={handleLogin}
                    >
                        Log In
                    </button>
                    <button
                        type="button"
                        className="communityWalkthroughBtnPrimary"
                        onClick={handleSignup}
                    >
                        Sign Up
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CommunityWalkthrough;
