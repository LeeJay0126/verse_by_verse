import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../../component/PageHeader";
import Footer from "../../../../component/Footer";
import { apiFetch } from "../../../../component/utils/ApiFetch";
import { buildHeroStyle } from "../../../../component/utils/ApiConfig";
import "./PostDetail.css";

const BibleStudyShare = () => {
  const { communityId, postId } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [post, setPost] = useState(null);

  const [loading, setLoading] = useState(true);
  const [screenError, setScreenError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [reflection, setReflection] = useState("");
  const [answers, setAnswers] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [existingSubmissionId, setExistingSubmissionId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setScreenError("");

      const [postRes, submissionRes] = await Promise.all([
        apiFetch(`/community/${communityId}/posts/${postId}`),
        apiFetch(`/community/${communityId}/posts/${postId}/study-submissions/me`),
      ]);

      const postData = await postRes.json().catch(() => ({}));
      const submissionData = await submissionRes.json().catch(() => ({}));

      if (!postRes.ok || !postData.ok) {
        throw new Error(postData.error || "Failed to load Bible Study.");
      }

      if (postData.post?.type !== "bible_study") {
        throw new Error("This share flow only works for Bible Study posts.");
      }

      setCommunity(postData.community || null);
      setPost(postData.post || null);

      const questionList = Array.isArray(postData.post?.studyContent?.questions)
        ? postData.post.studyContent.questions.filter((item) => String(item || "").trim())
        : [];

      const seededAnswers = Array.from({ length: questionList.length }, (_, index) => {
        return String(submissionData?.submission?.answers?.[index] || "");
      });

      setReflection(String(submissionData?.submission?.reflection || ""));
      setAnswers(seededAnswers);
      setExistingSubmissionId(submissionData?.submission?.id || null);
    } catch (e) {
      setScreenError(e.message || "Failed to load Bible Study.");
    } finally {
      setLoading(false);
    }
  }, [communityId, postId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const heroStyle = useMemo(() => buildHeroStyle(community?.heroImageUrl), [community]);

  const verses = Array.isArray(post?.passageSnapshot?.verses) ? post.passageSnapshot.verses : [];
  const questions = Array.isArray(post?.studyContent?.questions)
    ? post.studyContent.questions.filter((item) => String(item || "").trim())
    : [];

  const leaderNotes = String(post?.studyContent?.leaderNotes || "").trim();
  const leaderReflection = String(post?.studyContent?.reflection || "").trim();

  const totalSteps = 1 + questions.length;
  const isReflectionStep = stepIndex === 0;
  const currentQuestionIndex = Math.max(0, stepIndex - 1);
  const isLastStep = stepIndex === totalSteps - 1;
  const currentValue = isReflectionStep ? reflection : answers[currentQuestionIndex] || "";

  const handleChangeCurrentValue = (value) => {
    if (isReflectionStep) {
      setReflection(value);
      return;
    }

    setAnswers((prev) => prev.map((item, index) => (index === currentQuestionIndex ? value : item)));
  };

  const handleBack = () => {
    setSubmitError("");
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setSubmitError("");
    setStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleSubmit = async () => {
    const cleanReflection = reflection.trim();
    const cleanAnswers = answers.map((item) => String(item || "").trim());

    if (!cleanReflection && !cleanAnswers.some(Boolean)) {
      setSubmitError("Please write at least one response before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const res = await apiFetch(`/community/${communityId}/posts/${postId}/study-submissions`, {
        method: "POST",
        body: JSON.stringify({
          reflection: cleanReflection,
          answers: cleanAnswers,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit your share.");
      }

      setExistingSubmissionId(data.submission?.id || existingSubmissionId || null);
      navigate(`/community/${communityId}/posts/${postId}`);
    } catch (e) {
      setSubmitError(e.message || "Failed to submit your share.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="ForumContainer">
        <div className="ForumHero ForumHero--small" style={heroStyle}>
          <PageHeader />
        </div>
        <section className="ForumBody PostDetailBody">
          <p>Loading share flow…</p>
        </section>
        <Footer />
      </section>
    );
  }

  if (screenError || !post) {
    return (
      <section className="ForumContainer">
        <div className="ForumHero ForumHero--small" style={heroStyle}>
          <PageHeader />
        </div>
        <section className="ForumBody PostDetailBody">
          <p className="communityError">{screenError || "Bible Study not found."}</p>
          <Link className="BibleStudyComposerSecondary" to={`/community/${communityId}/posts/${postId}`}>
            Back to Bible Study
          </Link>
        </section>
        <Footer />
      </section>
    );
  }

  return (
    <section className="ForumContainer BibleStudySharePage">
      <div className="ForumHero ForumHero--small" style={heroStyle}>
        <PageHeader />
        <div className="ForumHeaderContainer">
          <h1 className="ForumHeader">{existingSubmissionId ? "Edit your reflection" : "Share your reflection"}</h1>
          <h2 className="ForumSubHeader">{post?.title}</h2>
        </div>
      </div>

      <section className="ForumBody PostDetailBody BibleStudyShareBody">
        <section className="BibleStudyDetailCard">
          <div className="BibleStudyComposerBreadcrumbs">
            <Link className="shareLink" to={`/community/${communityId}/posts/${postId}`}>Back to Bible Study</Link>
          </div>
          {!!post?.passage?.referenceLabel && (
            <div className="BibleStudyDetailReference">
              <span>Passage</span>
              <strong>{post.passage.referenceLabel}</strong>
            </div>
          )}

          {!!verses.length && (
            <section className="BibleStudyDetailSection">
              <h3>Passage</h3>
              <div className="BibleStudyDetailVerseList">
                {verses.map((verse) => (
                  <p key={`${verse.number}-${verse.text}`} className="BibleStudyDetailVerseItem">
                    <sup>{verse.number}</sup> {verse.text}
                  </p>
                ))}
              </div>
            </section>
          )}

          {!!leaderNotes && (
            <section className="BibleStudyDetailSection">
              <h3>Leader Notes</h3>
              <div className="BibleStudyDetailText">
                <p>{leaderNotes}</p>
              </div>
            </section>
          )}

          {!!leaderReflection && (
            <section className="BibleStudyDetailSection">
              <h3>Leader Reflection</h3>
              <div className="BibleStudyDetailText">
                <p>{leaderReflection}</p>
              </div>
            </section>
          )}

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

        <div className="BibleStudyShareBottomDock">
          <div className="BibleStudyShareBottomDockInner">
            <div className="BibleStudyShareProgress">
              <span>
                Step {stepIndex + 1} of {totalSteps}
              </span>
            </div>

            <div className="BibleStudySharePrompt">
              <h3>{isReflectionStep ? "Share your reflection first" : `Question ${currentQuestionIndex + 1}`}</h3>
              {!isReflectionStep && <p>{questions[currentQuestionIndex]}</p>}
            </div>

            {submitError && <div className="BibleStudyComposerError">{submitError}</div>}

            <textarea
              rows={6}
              value={currentValue}
              onChange={(e) => handleChangeCurrentValue(e.target.value)}
              placeholder={
                isReflectionStep
                  ? "Write your personal reflection, takeaway, or application."
                  : "Write your answer here."
              }
              className="BibleStudyShareTextarea"
              disabled={submitting}
            />

            <div className="BibleStudyShareActions">
              <button
                type="button"
                className="BibleStudyComposerSecondary"
                onClick={handleBack}
                disabled={submitting || stepIndex === 0}
              >
                Back
              </button>

              {!isLastStep ? (
                <button
                  type="button"
                  className="BibleStudyComposerPrimary"
                  onClick={handleNext}
                  disabled={submitting}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="BibleStudyComposerPrimary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : existingSubmissionId ? "Save" : "Submit"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </section>
  );
};

export default BibleStudyShare;
