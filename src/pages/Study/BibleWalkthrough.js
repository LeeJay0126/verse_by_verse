// src/pages/BibleWalkthrough/BibleWalkthrough.jsx
import PageHeader from "../../component/PageHeader";
import "./BibleWalkthrough.css";
import { useNavigate } from "react-router-dom";

const BibleWalkthrough = () => {
  const navigate = useNavigate();

  const handleBackToBible = () => navigate("/bible");
  const handleLogin = () => navigate("/account");
  const handleSignup = () => navigate("/signup");

  return (
    <div className="bibleWalkthrough">
      {/* HERO */}
      <header className="bibleWalkthroughHero">
        <PageHeader />

        <button
          type="button"
          className="bibleWalkthroughBackBtn"
          onClick={handleBackToBible}
          aria-label="Back to Bible"
        >
          ← Back
        </button>

        <div className="bibleWalkthroughHeroOverlay">
          <p className="bibleWalkthroughHeroEyebrow">Verse by Verse Bible</p>
          <h1 className="bibleWalkthroughHeroTitle">
            Walk through Bible, notes, and verse range
          </h1>
          <p className="bibleWalkthroughHeroSubtitle">
            Learn how to read, take notes, and focus on a specific passage.
          </p>
        </div>
      </header>

      {/* BODY */}
      <main className="bibleWalkthroughBody">
        <section className="bibleWalkthroughIntro">
          <h2>How it works</h2>
          <p>
            Follow these steps to get comfortable with the Bible page features
            before you log in.
          </p>
        </section>

        <ol className="bibleWalkthroughSteps">
          <li className="bibleWalkthroughStepCard">
            <div className="bibleWalkthroughStepNumber">1</div>
            <div className="bibleWalkthroughStepContent">
              <h3>Pick a book, chapter, and version</h3>
              <p>
                Use the selectors to choose your Bible version, then navigate to
                the book and chapter you want to read.
              </p>
            </div>
          </li>

          <li className="bibleWalkthroughStepCard">
            <div className="bibleWalkthroughStepNumber">2</div>
            <div className="bibleWalkthroughStepContent">
              <h3>Read verse-by-verse</h3>
              <p>
                Scroll through the chapter and tap verses to stay focused while
                studying.
              </p>
            </div>
          </li>

          <li className="bibleWalkthroughStepCard">
            <div className="bibleWalkthroughStepNumber">3</div>
            <div className="bibleWalkthroughStepContent">
              <h3>Write notes as you study</h3>
              <p>
                Open the notes area to capture observations, questions, and
                prayers. Your notes are saved when you’re logged in.
              </p>
            </div>
          </li>

          <li className="bibleWalkthroughStepCard">
            <div className="bibleWalkthroughStepNumber">4</div>
            <div className="bibleWalkthroughStepContent">
              <h3>Set a verse range for a chapter</h3>
              <p>
                Use the range controls to focus on a section (example: verses
                1–12) instead of the full chapter.
              </p>
            </div>
          </li>
        </ol>
      </main>

      <footer className="bibleWalkthroughFooter">
        <p className="bibleWalkthroughFooterText">Ready to try it for real?</p>

        <div className="bibleWalkthroughFooterButtons">
          <button
            type="button"
            className="bibleWalkthroughBtnSecondary"
            onClick={handleLogin}
          >
            Log In
          </button>
          <button
            type="button"
            className="bibleWalkthroughBtnPrimary"
            onClick={handleSignup}
          >
            Sign Up
          </button>
        </div>
      </footer>
    </div>
  );
};

export default BibleWalkthrough;
