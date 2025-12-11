import { useState } from "react";
import "./MyCommunity.css";

const POST_TYPES = [
  { value: "general",      label: "General",       className: "general" },
  { value: "questions",    label: "Questions",     className: "questions" },
  { value: "announcements",label: "Announcements", className: "announcements" },
  { value: "poll",         label: "Poll",          className: "poll" },   
];

const NewPostModal = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState(POST_TYPES[0].value);
  const [description, setDescription] = useState("");

  // Poll-specific state
  const [pollOptions, setPollOptions] = useState(["", ""]); // start with 2 blank options
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [anonymous, setAnonymous] = useState(true);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  const isPoll = type === "poll";

  const handleSubmit = (e) => {
    e.preventDefault();
    setGlobalError("");
    setErrors({});

    if (!title.trim()) {
      setGlobalError("Title is required.");
      return;
    }

    // For non-poll posts, description is required like before
    if (!isPoll && !description.trim()) {
      setGlobalError("Description is required.");
      return;
    }

    const selectedType = POST_TYPES.find((t) => t.value === type);

    let payload = {
      title: title.trim(),
      description: description.trim(),
      typeValue: type,
      typeLabel: selectedType?.label || "General",
      typeClass: selectedType?.className || "general",
    };

    if (isPoll) {
      const cleanedOptions = pollOptions
        .map((opt) => opt.trim())
        .filter(Boolean);

      if (cleanedOptions.length < 2) {
        setErrors((prev) => ({
          ...prev,
          pollOptions: "Please provide at least two options.",
        }));
        return;
      }

      // Attach poll config to payload for later backend work
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
      if (prev.length <= 2) return prev; // keep at least 2 inputs
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

        {globalError && (
          <div className="NewPostGlobalError">{globalError}</div>
        )}

        <form className="NewPostForm" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="NewPostField">
            <label htmlFor="post-title">
              {isPoll ? "Poll question" : "Title"}
            </label>
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

          {/* Type */}
          <div className="NewPostField">
            <label htmlFor="post-type">Post type</label>
            <select
              id="post-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {POST_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Poll-specific UI */}
          {isPoll && (
            <>
              <div
                className={`NewPostField ${
                  errors.pollOptions ? "has-error" : ""
                }`}
              >
                <label>Poll options</label>
                <div className="PollOptionsList">
                  {pollOptions.map((opt, index) => (
                    <div className="PollOptionRow" key={index}>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          handlePollOptionChange(index, e.target.value)
                        }
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
                  <div className="NewPostErrorText">
                    {errors.pollOptions}
                  </div>
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

          {/* Description (optional for polls, required for others) */}
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
