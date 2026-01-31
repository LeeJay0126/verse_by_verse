import { useMemo, useState } from "react";
import "./MyCommunity.css";
import { COMMUNITY_TYPES, getTypeByApiValue } from "../communityTypes";

const MAX_ANNOUNCEMENTS_PER_COMMUNITY = 3;

const NewPostModal = ({ onClose, onSubmit, announcementCount = 0 }) => {
  const typeOptions = useMemo(() => COMMUNITY_TYPES, []);

  const [title, setTitle] = useState("");
  const [type, setType] = useState(typeOptions[0]?.apiValue || "general");
  const [description, setDescription] = useState("");

  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [anonymous, setAnonymous] = useState(true);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  const selectedType = useMemo(() => getTypeByApiValue(type), [type]);
  const isPoll = !!selectedType?.isPoll;

  const announcementsDisabled =
    selectedType?.apiValue === "announcements" &&
    announcementCount >= MAX_ANNOUNCEMENTS_PER_COMMUNITY;

  const handleSubmit = (e) => {
    e.preventDefault();
    setGlobalError("");
    setErrors({});

    if (!title.trim()) {
      setGlobalError("Title is required.");
      return;
    }

    if (
      selectedType?.apiValue === "announcements" &&
      announcementCount >= MAX_ANNOUNCEMENTS_PER_COMMUNITY
    ) {
      setGlobalError(`This community already has ${MAX_ANNOUNCEMENTS_PER_COMMUNITY} announcements.`);
      return;
    }

    if (!isPoll && !description.trim()) {
      setGlobalError("Description is required.");
      return;
    }

    let payload = {
      title: title.trim(),
      description: description.trim(),
      typeValue: selectedType?.apiValue || "general",
      typeLabel: selectedType?.label || "General",
      typeClass: selectedType?.className || "general",
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

    onSubmit?.(payload);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("NewPostOverlay")) {
      onClose?.();
    }
  };

  const handlePollOptionChange = (index, value) => {
    setPollOptions((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleAddPollOption = () => {
    setPollOptions((prev) => [...prev, ""]);
  };

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
          <h2>{isPoll ? "Create Poll" : "Create New Post"}</h2>
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
                isPoll
                  ? "e.g. Which day works best for our study group?"
                  : "Enter a clear, descriptive title"
              }
              required
            />
          </div>

          <div className="NewPostField">
            <label htmlFor="post-type">Post type</label>
            <select
              id="post-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {typeOptions.map((option) => {
                const isAnnouncements = option.apiValue === "announcements";
                const disabled =
                  isAnnouncements && announcementCount >= MAX_ANNOUNCEMENTS_PER_COMMUNITY;

                return (
                  <option
                    key={option.apiValue}
                    value={option.apiValue}
                    disabled={disabled}
                  >
                    {option.label}
                    {disabled ? " (limit reached)" : ""}
                  </option>
                );
              })}
            </select>

            {announcementsDisabled && (
              <div className="NewPostErrorText">
                This community already has {MAX_ANNOUNCEMENTS_PER_COMMUNITY} announcements.
              </div>
            )}
          </div>

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

                <button
                  type="button"
                  className="PollAddOptionButton"
                  onClick={handleAddPollOption}
                >
                  + Add option
                </button>

                {errors.pollOptions && (
                  <div className="NewPostErrorText">{errors.pollOptions}</div>
                )}
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

          <div className="NewPostField">
            <label htmlFor="post-description">
              {isPoll ? "Description (optional)" : "Description"}
            </label>
            <textarea
              id="post-description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isPoll
                  ? "Add any additional context or instructions for your poll…"
                  : "Share the details of your question, update, or reflection…"
              }
              required={!isPoll}
            />
          </div>

          <div className="NewPostActions">
            <button
              type="button"
              className="NewPostSecondaryButton"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="NewPostPrimaryButton">
              {isPoll ? "Create Poll" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPostModal;
