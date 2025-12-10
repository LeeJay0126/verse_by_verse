// src/pages/Community/myCommunity/NewPostModal.jsx
import { useState } from "react";
import "./MyCommunity.css";

const POST_TYPES = [
  { value: "general", label: "General", className: "general" },
  { value: "questions", label: "Questions", className: "questions" },
  { value: "announcements", label: "Announcements", className: "announcements" },
];

const NewPostModal = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState(POST_TYPES[0].value);
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const selectedType = POST_TYPES.find((t) => t.value === type);

    onSubmit?.({
      title: title.trim(),
      description: description.trim(),
      typeValue: type,
      typeLabel: selectedType?.label || "General",
      typeClass: selectedType?.className || "general",
    });
  };

  const handleOverlayClick = (e) => {
    // Close when clicking outside the modal content
    if (e.target.classList.contains("NewPostOverlay")) {
      onClose?.();
    }
  };

  return (
    <div className="NewPostOverlay" onClick={handleOverlayClick}>
      <div className="NewPostModal">
        <header className="NewPostHeader">
          <h2>Create New Post</h2>
          <button
            type="button"
            className="NewPostCloseButton"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>

        <form className="NewPostForm" onSubmit={handleSubmit}>
          <div className="NewPostField">
            <label htmlFor="post-title">Title</label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, descriptive title"
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
              {POST_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

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

          <div className="NewPostActions">
            <button
              type="button"
              className="NewPostSecondaryButton"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="NewPostPrimaryButton">
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPostModal;
