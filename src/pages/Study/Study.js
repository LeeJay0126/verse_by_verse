import BibleHeader from "../Read/BibleHeader";
import Bible from "./Bible";
import "./Study.css";

const Study = () => {
  return (
    <section className="Study">
      <div className="StudyHero">
        <BibleHeader />
        <h1 className="StudyHeader">Read, Record, and Reflect</h1>
        <h2 className="StudyH2">
          Read the bible verse by verse and record your insights on Verse By
          Verse
        </h2>
      </div>
      <Bible />
    </section>
  );
};

export default Study;
