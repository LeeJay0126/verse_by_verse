import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyCommunity.css";
import { COMMUNITY_TYPES, getTypeByApiValue } from "../communityTypes";

const MAX_ANNOUNCEMENTS_PER_COMMUNITY = 3;

const NewPostModal = ({
  communityId,
  onClose,
  onSubmit,
  announcementCount = 0,
  canCreateAnnouncement = false,
  canCreateBibleStudy = false,
}) => {
  const navigate = useNavigate();
  const typeOptions = useMemo(() => COMMUNITY_TYPES, []);

  const isTypeDisabled = useCallback((apiValue) => {
    if (apiValue === "bible_study") return !canCreateBibleStudy;
    if (apiValue === "announcements") {
      return !canCreateAnnouncement || announcementCount >= MAX_ANNOUNCEMENTS_PER_COMMUNITY;
    }
    return false;
  }, [announcementCount, canCreateAnnouncement, canCreateBibleStudy]);

  const defaultType = useMemo(() => {
    return typeOptions.find((option) => !isTypeDisabled(option.apiValue))?.apiValue || "questions";
  }, [isTypeDisabled, typeOptions]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState(defaultType);
  const [description, setDescription] = useState("");

  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [anonymous, setAnonymous] = useState(true);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedType = useMemo(() => getTypeByApiValue(type), [type]);
  const isPoll = !!selectedType?.isPoll;
  const isBibleStudy = selectedType?.apiValue === "bible_study";

  useEffect(() => {
    if (isTypeDisabled(type)) setType(defaultType);
  }, [defaultType, isTypeDisabled, type]);

  const announcementsDisabled =
    selectedType?.apiValue === "announcements" &&
    announcementCount >= MAX_ANNOUNCEMENTS_PER_COMMUNITY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;

    setGlobalError("");
    setErrors({});

    const cleanTitle = title.trim();
    const cleanBody = description.trim();
    const cleanType = selectedType?.apiValue || "bible_study";

    if (cleanType === "bible_study") {
      if (!canCreateBibleStudy) {
        setGlobalError("Only community leaders or the owner can create Bible Study posts.");
        return;
      }

      onClose?.();
      navigate(`/community/${communityId}/bible-study/new`, {
        state: {
          draftTitle: cleanTitle,
          draftBody: cleanBody,
        },
      });
      return;
    }

    if (!cleanTitle) {
      setGlobalError("Title is required.");
      return;
    }

    if (cleanType === "announcements" && announcementCount >= MAX_ANNOUNCEMENTS_PER_COMMUNITY) {
      setGlobalError(`This community already has ${MAX_ANNOUNCEMENTS_PER_COMMUNITY} announcements.`);
      return;
    }

    if (cleanType === "announcements" && !canCreateAnnouncement) {
      setGlobalError("Only community leaders or the owner can create announcements.");
      return;
    }

    if (!isPoll && !cleanBody) {
      setGlobalError("Description is required.");
      return;
    }

    let payload = {
      title: cleanTitle,
      body: cleanBody,
      type: cleanType,
    };

    if (isPoll) {
      const cleanedOptions = pollOptions.map((opt) => opt.trim()).filter(Boolean);

      if (cleanedOptions.length < 2) {
        setErrors((prev) => ({
          ...prev,
          pollOptions: "Please provide at least two options.",
        }));
        return;
      }

      payload = {
        ...payload,
        poll: {
          options: cleanedOptions,
          allowMultiple,
          anonymous,
        },
      };
    }

    try {
      submittingRef.current = true;
      setSubmitting(true);
      const result = await onSubmit?.(payload);
      if (result && result.ok === false && result.message) {
        setGlobalError(result.message);
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("NewPostOverlay")) onClose?.();
  };

  const handlePollOptionChange = (index, value) => {
    setPollOptions((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleAddPollOption = () => setPollOptions((prev) => [...prev, ""]);

  const handleRemovePollOption = (index) => {
    setPollOptions((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="NewPostOverlay" onClick={handleOverlayClick}>
      <div className="NewPostModal">
        <header className="NewPostHeader">
          <h2>
            {isBibleStudy ? "Start Bible Study Post" : isPoll ? "Create Poll" : "Create New Post"}
          </h2>
          <button
            type="button"
            className="NewPostCloseButton"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>

        {globalError && <div className="NewPostGlobalError">{globalError}</div>}

        <form className="NewPostForm" onSubmit={handleSubmit}>
          <div className="NewPostField">
            <label htmlFor="post-title">{isPoll ? "Poll question" : "Title"}</label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                isBibleStudy
                  ? "Enter your Bible study title"
                  : isPoll
                  ? "e.g. Which day works best for our study group?"
                  : "Enter a clear, descriptive title"
              }
            />
          </div>

          <div className="NewPostField">
            <label htmlFor="post-type">Post type</label>
            <select id="post-type" value={type} onChange={(e) => setType(e.target.value)}>
              {typeOptions.map((option) => {
                const isAnnouncements = option.apiValue === "announcements";
                const disabledAnnouncement = isAnnouncements && isTypeDisabled(option.apiValue);
                const disabledBibleStudy =
                  option.apiValue === "bible_study" && !canCreateBibleStudy;

                return (
                  <option
                    key={option.apiValue}
                    value={option.apiValue}
                    disabled={disabledAnnouncement || disabledBibleStudy}
                  >
                    {option.label}
                    {isAnnouncements && !canCreateAnnouncement ? " (leaders/owner only)" : ""}
                    {isAnnouncements &&
                    canCreateAnnouncement &&
                    announcementCount >= MAX_ANNOUNCEMENTS_PER_COMMUNITY
                      ? " (limit reached)"
                      : ""}
                    {disabledBibleStudy ? " (leaders/owner only)" : ""}
                  </option>
                );
              })}
            </select>

            {announcementsDisabled && (
              <div className="NewPostErrorText">
                This community already has {MAX_ANNOUNCEMENTS_PER_COMMUNITY} announcements.
              </div>
            )}

            {!canCreateAnnouncement && type === "announcements" && (
              <div className="NewPostErrorText">
                Only community leaders or the owner can create announcements.
              </div>
            )}

            {!canCreateBibleStudy && type === "bible_study" && (
              <div className="NewPostErrorText">
                Only community leaders or the owner can create Bible Study posts.
              </div>
            )}
          </div>

          {isBibleStudy && (
            <div className="NewPostField">
              <label htmlFor="post-description">Optional opening note</label>
              <textarea
                id="post-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="You can prefill a short opening note here. The full study composer opens next."
              />
            </div>
          )}

          {isPoll && (
            <>
              <div className={`NewPostField ${errors.pollOptions ? "has-error" : ""}`}>
                <label>Poll options</label>
                <div className="PollOptionsList">
                  {pollOptions.map((opt, index) => (
                    <div className="PollOptionRow" key={index}>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="PollOptionRemoveButton"
                        onClick={() => handleRemovePollOption(index)}
                        disabled={pollOptions.length <= 2}
                        aria-label="Remove option"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" className="PollAddOptionButton" onClick={handleAddPollOption}>
                  + Add option
                </button>

                {errors.pollOptions && <div className="NewPostErrorText">{errors.pollOptions}</div>}
              </div>

              <div className="NewPostField PollSettingsField">
                <label>Poll settings</label>
                <div className="PollSettings">
                  <label className="PollSettingOption">
                    <input
                      type="checkbox"
                      checked={allowMultiple}
                      onChange={(e) => setAllowMultiple(e.target.checked)}
                    />
                    <span>Allow voting for multiple options</span>
                  </label>
                  <label className="PollSettingOption">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                    />
                    <span>Vote anonymously</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {!isPoll && !isBibleStudy && (
            <div className="NewPostField">
              <label htmlFor="post-description">Description</label>
              <textarea
                id="post-description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share the details of your question, update, or reflection…"
                required
              />
            </div>
          )}

          <div className="NewPostActions">
            <button type="button" className="NewPostSecondaryButton" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="NewPostPrimaryButton" disabled={submitting}>
              {submitting ? "Posting..." : isBibleStudy ? "Continue" : isPoll ? "Create Poll" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPostModal;
