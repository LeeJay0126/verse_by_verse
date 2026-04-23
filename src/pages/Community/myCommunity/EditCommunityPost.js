import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../component/Footer";
import PageHeader from "../../../component/PageHeader";
import { apiFetch } from "../../../component/utils/ApiFetch";
import { emitCommunityActivityUpdated } from "../../../component/utils/CommunityEvents";
import { getTypeByApiValue } from "../communityTypes";
import "./EditCommunityPost.css";

const EDITABLE_TYPES = [
  { label: "Questions", value: "questions" },
  { label: "Announcements", value: "announcements" },
  { label: "Poll", value: "poll" },
];

const darkTextStyle = { color: "#0f0f0f" };
const darkControlStyle = {
  color: "#0f0f0f",
  WebkitTextFillColor: "#0f0f0f",
  caretColor: "#0f0f0f",
  colorScheme: "light",
};

const getInitialPollOptions = (poll) => {
  const options = Array.isArray(poll?.options)
    ? poll.options.map((option) => String(option?.text ?? option ?? "")).filter(Boolean)
    : [];
  return options.length >= 2 ? options : ["", ""];
};

const EditCommunityPost = () => {
  const { communityId, postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("questions");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [anonymous, setAnonymous] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchPost() {
      try {
        setLoading(true);
        setError("");

        const res = await apiFetch(`/community/${communityId}/posts/${postId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load post.");
        }

        const nextPost = data.post || null;
        if (!nextPost) throw new Error("Post not found.");

        if (nextPost.type === "bible_study") {
          navigate(`/community/${communityId}/bible-study/${postId}/edit`, { replace: true });
          return;
        }

        if (!cancelled) {
          setPost(nextPost);
          setTitle(nextPost.title || "");
          setBody(nextPost.body || "");
          setType(getTypeByApiValue(nextPost.type).apiValue || "questions");
          setPollOptions(getInitialPollOptions(nextPost.poll));
          setAllowMultiple(Boolean(nextPost.poll?.allowMultiple));
          setAnonymous(nextPost.poll?.anonymous !== false);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load post.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPost();

    return () => {
      cancelled = true;
    };
  }, [communityId, postId, navigate]);

  const isPoll = type === "poll";
  const payload = useMemo(() => {
    const next = {
      title: title.trim(),
      body: body.trim(),
      type,
    };

    if (isPoll) {
      next.poll = {
        options: pollOptions.map((option) => option.trim()).filter(Boolean),
        allowMultiple,
        anonymous,
      };
    }

    return next;
  }, [allowMultiple, anonymous, body, isPoll, pollOptions, title, type]);

  const hasChanges = useMemo(() => {
    if (!post) return false;
    const currentType = getTypeByApiValue(post.type).apiValue || "questions";
    const currentOptions = getInitialPollOptions(post.poll).map((option) => option.trim()).filter(Boolean);

    return (
      payload.title !== String(post.title || "").trim() ||
      payload.body !== String(post.body || "").trim() ||
      payload.type !== currentType ||
      JSON.stringify(payload.poll?.options || []) !== JSON.stringify(currentOptions) ||
      Boolean(payload.poll?.allowMultiple) !== Boolean(post.poll?.allowMultiple) ||
      (payload.poll?.anonymous ?? true) !== (post.poll?.anonymous !== false)
    );
  }, [payload, post]);

  const validate = () => {
    if (!payload.title) return isPoll ? "Poll question is required." : "Title is required.";
    if (!isPoll && !payload.body) return "Description is required.";
    if (isPoll && payload.poll.options.length < 2) return "Please provide at least two poll options.";
    return "";
  };

  const handlePollOptionChange = (index, value) => {
    setPollOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemovePollOption = (index) => {
    setPollOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !hasChanges) return;

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const res = await apiFetch(`/community/${communityId}/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to update post.");
      }

      emitCommunityActivityUpdated();
      navigate(`/community/${communityId}/posts/${postId}`);
    } catch (e) {
      setError(e.message || "Failed to update post.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="EditPostPage" style={darkTextStyle}>
      <PageHeader />
      <main className="EditPostBody" style={darkTextStyle}>
        <button
          type="button"
          className="EditPostBack"
          style={darkTextStyle}
          onClick={() => navigate(`/community/${communityId}/posts/${postId}`)}
        >
          Back to post
        </button>

        <section className="EditPostCard" style={darkTextStyle}>
          <header className="EditPostHeader" style={darkTextStyle}>
            <p className="EditPostKicker" style={darkTextStyle}>Community post</p>
            <h1 style={darkTextStyle}>Edit post</h1>
          </header>

          {loading ? (
            <p className="EditPostState" style={darkTextStyle}>Loading post...</p>
          ) : (
            <form className="EditPostForm" style={darkTextStyle} onSubmit={handleSubmit}>
              {error && <div className="EditPostError">{error}</div>}

              <label className="EditPostField" style={darkTextStyle}>
                {isPoll ? "Poll question" : "Title"}
                <input style={darkControlStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>

              <label className="EditPostField" style={darkTextStyle}>
                Post type
                <select style={darkControlStyle} value={type} onChange={(e) => setType(e.target.value)}>
                  {EDITABLE_TYPES.map((option) => (
                    <option key={option.value} value={option.value} style={darkControlStyle}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {isPoll ? (
                <>
                  <div className="EditPostField" style={darkTextStyle}>
                    <span style={darkTextStyle}>Poll options</span>
                    <div className="EditPollOptions">
                      {pollOptions.map((option, index) => (
                        <div className="EditPollOptionRow" key={index}>
                          <input
                            style={darkControlStyle}
                            value={option}
                            onChange={(e) => handlePollOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          <button
                            type="button"
                            className="EditPollRemove"
                            style={darkTextStyle}
                            onClick={() => handleRemovePollOption(index)}
                            disabled={pollOptions.length <= 2}
                            aria-label="Remove poll option"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="EditPollAdd"
                      style={darkTextStyle}
                      onClick={() => setPollOptions((prev) => [...prev, ""])}
                    >
                      + Add option
                    </button>
                  </div>

                  <div className="EditPostChecks" style={darkTextStyle}>
                    <label style={darkTextStyle}>
                      <input
                        type="checkbox"
                        checked={allowMultiple}
                        onChange={(e) => setAllowMultiple(e.target.checked)}
                      />
                      Allow voting for multiple options
                    </label>
                    <label style={darkTextStyle}>
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                      />
                      Vote anonymously
                    </label>
                  </div>
                </>
              ) : (
                <label className="EditPostField" style={darkTextStyle}>
                  Description
                  <textarea style={darkControlStyle} rows={7} value={body} onChange={(e) => setBody(e.target.value)} />
                </label>
              )}

              <div className="EditPostActions" style={darkTextStyle}>
                <button
                  type="button"
                  className="EditPostSecondary"
                  style={darkTextStyle}
                  onClick={() => navigate(`/community/${communityId}/posts/${postId}`)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button className="EditPostPrimary" type="submit" disabled={saving || !hasChanges}>
                  {saving ? "Saving..." : hasChanges ? "Save changes" : "No changes"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </section>
  );
};

export default EditCommunityPost;
