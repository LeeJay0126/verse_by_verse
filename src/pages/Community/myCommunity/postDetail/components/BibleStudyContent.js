import "./BibleStudyContent.css"
const Section = ({ title, children }) => {
  if (!children) return null;

  return (
    <section className="BibleStudyDetailSection">
      <h3>Bible Study {title}</h3>
      <div className="BibleStudyDetailText">{children}</div>
    </section>
  );
};

const BibleStudyContent = ({ post }) => {
  const referenceLabel = post?.passage?.referenceLabel || "";
  const verses = Array.isArray(post?.passageSnapshot?.verses) ? post.passageSnapshot.verses : [];
  const leaderNotes = (post?.studyContent?.leaderNotes || "").trim();
  const reflection = (post?.studyContent?.reflection || "").trim();
  const questions = Array.isArray(post?.studyContent?.questions)
    ? post.studyContent.questions.filter((item) => String(item || "").trim())
    : [];

  const hasStructuredContent =
    referenceLabel || verses.length || leaderNotes || reflection || questions.length;

  if (!hasStructuredContent) return null;

  return (
    <section className="BibleStudyDetailCard">
      {!!verses.length && (
        <section className="BibleStudyDetailSection">
          {referenceLabel && (
            <div className="BibleStudyDetailReference">
              <h3>Passage : <strong>{referenceLabel}</strong></h3>
            </div>
          )}
          <div className="BibleStudyDetailVerseList">
            {verses.map((verse) => (
              <p key={`${referenceLabel}-${verse.number}`} className="BibleStudyDetailVerseItem">
                <sup>{verse.number}</sup> {verse.text}
              </p>
            ))}
          </div>
        </section>
      )}

      <Section className="LeaderNotes" title="Leader Notes">
        <p>{leaderNotes}</p>
      </Section>

      <Section className="Reflection" title="성경나눔 / Reflection">
        <p>{reflection}</p>
      </Section>

      {!!questions.length && (
        <section className="BibleStudyDetailSection">
          <h3>Discussion Questions</h3>
          <ol className="BibleStudyDetailQuestions">
            {questions.map((question, index) => (
              <li key={`${index}-${question}`}>{question}</li>
            ))}
          </ol>
        </section>
      )}
    </section>
  );
};

export default BibleStudyContent;