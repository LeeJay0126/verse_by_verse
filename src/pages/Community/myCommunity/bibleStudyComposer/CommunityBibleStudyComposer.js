import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../../component/PageHeader";
import Footer from "../../../../component/Footer";
import { useAuth } from "../../../../component/context/AuthContext";
import { apiFetch } from "../../../../component/utils/ApiFetch";
import { buildHeroStyle } from "../../../../component/utils/ApiConfig";
import { emitCommunityActivityUpdated } from "../../../../component/utils/CommunityEvents";
import BibleStudyPassagePicker from "./BibleStudyPassagePicker";
import "./CommunityBibleStudyComposer.css";


const CommunityBibleStudyComposer = () => {
  const { communityId, postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditMode = Boolean(postId);

  const [community, setCommunity] = useState(null);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [communityError, setCommunityError] = useState("");

  const [loadingPost, setLoadingPost] = useState(false);
  const [postError, setPostError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [leaderNotes, setLeaderNotes] = useState("");
  const [reflection, setReflection] = useState("");
  const [questions, setQuestions] = useState([""]);
  const [passageData, setPassageData] = useState(null);
  const [initialPassageData, setInitialPassageData] = useState(null);

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const currentUserId = String(user?.id || user?._id || "");

  const fetchCommunity = useCallback(async () => {
    try {
      setLoadingCommunity(true);
      setCommunityError("");

      const res = await apiFetch(`/community/${communityId}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load community.");
      }

      setCommunity(data.community || null);
    } catch (e) {
      setCommunityError(e.message || "Failed to load community.");
    } finally {
      setLoadingCommunity(false);
    }
  }, [communityId]);

  const fetchExistingPost = useCallback(async () => {
    if (!isEditMode) return;

    try {
      setLoadingPost(true);
      setPostError("");

      const res = await apiFetch(`/community/${communityId}/posts/${postId}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load Bible Study.");
      }

      const existingPost = data.post || null;
      if (!existingPost || existingPost.type !== "bible_study") {
        throw new Error("This post is not a Bible Study.");
      }

      setTitle(existingPost.title || "");
      setBody(existingPost.body || "");
      setLeaderNotes(existingPost.studyContent?.leaderNotes || "");
      setReflection(existingPost.studyContent?.reflection || "");

      const existingQuestions = Array.isArray(existingPost.studyContent?.questions)
        ? existingPost.studyContent.questions.filter((item) => String(item || "").trim())
        : [];

      setQuestions(existingQuestions.length ? existingQuestions : [""]);

      const nextInitialPassage = {
        versionId: existingPost.passage?.versionId || "",
        versionLabel: existingPost.passage?.versionLabel || "",
        bookId: existingPost.passage?.bookId || "",
        bookName: existingPost.passage?.bookName || "",
        chapterId: existingPost.passage?.chapterId || "",
        chapterNumber: existingPost.passage?.chapterNumber || null,
        rangeStart: existingPost.passage?.rangeStart ?? null,
        rangeEnd: existingPost.passage?.rangeEnd ?? null,
        referenceLabel: existingPost.passage?.referenceLabel || "",
        verses: Array.isArray(existingPost.passageSnapshot?.verses)
          ? existingPost.passageSnapshot.verses
          : [],
      };

      setInitialPassageData(nextInitialPassage);
      setPassageData(nextInitialPassage);
    } catch (e) {
      setPostError(e.message || "Failed to load Bible Study.");
    } finally {
      setLoadingPost(false);
    }
  }, [communityId, postId, isEditMode]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  useEffect(() => {
    fetchExistingPost();
  }, [fetchExistingPost]);

  const canCreateBibleStudy = useMemo(() => {
    if (!community || !currentUserId) return false;

    const ownerId = String(community?.owner?.id || community?.owner?._id || "");
    if (ownerId && ownerId === currentUserId) return true;

    return (
      Array.isArray(community?.members) &&
      community.members.some(
        (member) =>
          (String(member.role || "").toLowerCase() === "leader" ||
            String(member.role || "").toLowerCase() === "owner") &&
          String(member.id || member._id || "") === currentUserId
      )
    );
  }, [community, currentUserId]);

  const heroStyle = useMemo(() => buildHeroStyle(community?.heroImageUrl), [community]);

  const handleQuestionChange = (index, value) => {
    setQuestions((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, ""]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    const cleanLeaderNotes = leaderNotes.trim();
    const cleanReflection = reflection.trim();
    const cleanQuestions = questions.map((item) => item.trim()).filter(Boolean);

    if (!canCreateBibleStudy) {
      setSubmitError("Only community leaders or the owner can manage Bible Study posts.");
      return;
    }

    if (!cleanTitle) {
      setSubmitError("Title is required.");
      return;
    }

    if (!passageData?.referenceLabel || !passageData?.verses?.length) {
      setSubmitError("Please select a valid Bible passage.");
      return;
    }

    if (!cleanBody && !cleanLeaderNotes && !cleanReflection) {
      setSubmitError("Add at least an opening note, leader notes, or 성경나눔.");
      return;
    }

    try {
      setSaving(true);
      setSubmitError("");

      const payload = {
        title: cleanTitle,
        body: cleanBody,
        type: "bible_study",
        passage: {
          versionId: passageData.versionId,
          versionLabel: passageData.versionLabel,
          bookId: passageData.bookId,
          bookName: passageData.bookName,
          chapterId: passageData.chapterId,
          chapterNumber: passageData.chapterNumber,
          rangeStart: passageData.rangeStart,
          rangeEnd: passageData.rangeEnd,
          referenceLabel: passageData.referenceLabel,
        },
        passageSnapshot: {
          verses: passageData.verses,
        },
        studyContent: {
          leaderNotes: cleanLeaderNotes,
          reflection: cleanReflection,
          questions: cleanQuestions,
        },
      };

      const endpoint = isEditMode
        ? `/community/${communityId}/posts/${postId}`
        : `/community/${communityId}/posts`;

      const method = isEditMode ? "PUT" : "POST";

      const res = await apiFetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(
          data.error || (isEditMode ? "Failed to update Bible Study." : "Failed to create Bible Study.")
        );
      }

      emitCommunityActivityUpdated();

      const nextPostId = isEditMode ? postId : data.postId;
      if (nextPostId) {
        navigate(`/community/${communityId}/posts/${nextPostId}`);
        return;
      }

      navigate(`/community/${communityId}/my-posts`);
    } catch (e) {
      setSubmitError(e.message || (isEditMode ? "Failed to update Bible Study." : "Failed to create Bible Study."));
    } finally {
      setSaving(false);
    }
  };

  if (loadingCommunity || loadingPost) {
    return (
      <section className="ForumContainer">
        <div className="ForumHero ForumHero--small" style={heroStyle}>
          <PageHeader />
        </div>
        <section className="ForumBody BibleStudyComposerBody">
          <p>{isEditMode ? "Loading Bible Study…" : "Loading composer…"}</p>
        </section>
        <Footer />
      </section>
    );
  }

  if (communityError || postError) {
    return (
      <section className="ForumContainer">
        <div className="ForumHero ForumHero--small" style={heroStyle}>
          <PageHeader />
        </div>
        <section className="ForumBody BibleStudyComposerBody">
          <div className="BibleStudyComposerError">{communityError || postError}</div>
          <Link className="BibleStudyComposerSecondary" to={`/community/${communityId}/my-posts`}>
            Back to community
          </Link>
        </section>
        <Footer />
      </section>
    );
  }

  return (
    <section className="ForumContainer">
      <div className="ForumHero ForumHero--small" style={heroStyle}>
        <PageHeader />

        <div className="ForumHeaderContainer">
          <div className="BibleStudyComposerBreadcrumbs">
          </div>
          <h1 className="ForumHeader">{isEditMode ? "Edit Bible Study" : "Create Bible Study"}</h1>
          <h2 className="ForumSubHeader">
            Build a structured post with passage selection, notes, and discussion questions.
          </h2>
        </div>
      </div>

      <section className="ForumBody BibleStudyComposerBody">
        <Link className="createBibleStudyLink" to={isEditMode ? `/community/${communityId}/posts/${postId}` : `/community/${communityId}/my-posts`}>
          {isEditMode ? "Back to Bible Study" : "Back to community posts"}
        </Link>
        {!canCreateBibleStudy && (
          <div className="BibleStudyComposerError">
            Only community leaders or the owner can create Bible Study posts in this community.
          </div>
        )}

        <form className="BibleStudyComposerForm" onSubmit={handleSubmit}>
          <section className="BibleStudyComposerCard">
            <div className="BibleStudyComposerCardHeader">
              <h2>Post details</h2>
              <p>Start with a clear title and an optional opening note.</p>
            </div>

            {submitError && <div className="BibleStudyComposerError">{submitError}</div>}

            <div className="BibleStudyField">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Trusting God in the storm"
              />
            </div>

            <div className="BibleStudyField">
              <label>Opening note</label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Optional short intro shown near the top of the post."
              />
            </div>
          </section>

          <BibleStudyPassagePicker initialValue={initialPassageData} onChange={setPassageData} />

          <section className="BibleStudyComposerCard">
            <div className="BibleStudyComposerCardHeader">
              <h2>Leader notes</h2>
              <p>This is where you guide the group through the passage.</p>
            </div>

            <div className="BibleStudyField">
              <label>Leader notes</label>
              <textarea
                rows={8}
                value={leaderNotes}
                onChange={(e) => setLeaderNotes(e.target.value)}
                placeholder="Share key observations, context, and teaching notes."
              />
            </div>

            <div className="BibleStudyField">
              <label>성경나눔 / reflection</label>
              <textarea
                rows={8}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Add personal reflection, application, or sharing points."
              />
            </div>
          </section>

          <section className="BibleStudyComposerCard">
            <div className="BibleStudyComposerCardHeader">
              <h2>Discussion questions</h2>
              <p>These will render as a clean list in the post detail page.</p>
            </div>

            <div className="BibleStudyQuestionsList">
              {questions.map((question, index) => (
                <div className="BibleStudyQuestionRow" key={index}>
                  <textarea
                    rows={4}
                    value={question}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    placeholder={`Question ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="BibleStudyComposerIconButton"
                    onClick={() => handleRemoveQuestion(index)}
                    disabled={questions.length <= 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="BibleStudyComposerSecondary"
              onClick={handleAddQuestion}
            >
              + Add question
            </button>
          </section>

          <div className="BibleStudyComposerActions">
            <Link
              className="BibleStudyComposerSecondary"
              to={isEditMode ? `/community/${communityId}/posts/${postId}` : `/community/${communityId}/my-posts`}
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="BibleStudyComposerPrimary"
              disabled={saving || !canCreateBibleStudy}
            >
              {saving ? (isEditMode ? "Saving…" : "Publishing…") : isEditMode ? "Save Bible Study" : "Publish Bible Study"}
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </section>
  );
};

export default CommunityBibleStudyComposer;