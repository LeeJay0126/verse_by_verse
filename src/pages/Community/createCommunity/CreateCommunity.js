import Footer from "../../../component/Footer";
import PageHeader from "../../../component/PageHeader";
import "./CreateCommunity.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";

const CreateCommunity = () => {
  const [form, setForm] = useState({
    header: "",
    subheader: "",
    content: "",
    type: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting community:", form);
  };

  const handleBack = () => {
    navigate(-1); // or navigate("/community")
  };

  return (
    <section className="createCommunity">
      {/* HERO SECTION */}
      <section className="createCommunityHero">
        <PageHeader />
        <h1 className="createCommunityHeader">Create a Community</h1>
      </section>

      <div className="createCommunityBackWrapper">
        <button
          type="button"
          className="createCommunityBackButton"
          onClick={handleBack}
        >
          <FaArrowLeft className="createCommunityBackIcon" />
        </button>
      </div>

      {/* FORM SECTION */}
      <section className="createCommunityFormWrapper">
        <form className="createCommunityForm" onSubmit={handleSubmit}>
          <label className="createLabel">
            Community Name
            <input
              type="text"
              name="header"
              value={form.header}
              onChange={handleChange}
              placeholder="Enter the name of your community"
              className="createInput"
              required
            />
          </label>

          <label className="createLabel">
            Purpose / Subheader
            <input
              type="text"
              name="subheader"
              value={form.subheader}
              onChange={handleChange}
              placeholder="Brief description of your community's purpose"
              className="createInput"
              required
            />
          </label>

          <label className="createLabel">
            Community Type
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="createSelect"
              required
            >
              <option value="">Select a type…</option>
              <option value="Church Organization">Church organization</option>
              <option value="Bible Study">Bible study</option>
              <option value="Read Through">Read Through</option>
              <option value="Prayer Group">Prayer group</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="createLabel">
            Description
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Describe what this community is about, who it's for, and what members will do."
              className="createTextarea"
              rows={5}
              required
            />
          </label>

          <button className="createCommunityButton" type="submit">
            Create Community
          </button>
        </form>
      </section>

      <Footer />
    </section>
  );
};

export default CreateCommunity;
