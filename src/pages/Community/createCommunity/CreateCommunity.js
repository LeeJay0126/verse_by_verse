import Footer from "../../../component/Footer";
import PageHeader from "../../../component/PageHeader";
import "./CreateCommunity.css";
import { useState } from "react";

const CreateCommunity = () => {
  const [form, setForm] = useState({
    header: "",
    subheader: "",
    content: "",
    type: "",        
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Submitting community:", form);
    // Later: API call goes here
  };

  return (
    <section className="createCommunity">
      <section className="createCommunityHero">
        <PageHeader />
        {/* Left this in for design purposes. Might remove later */}
        <h1 className="createCommunityHeader">Create a Community</h1>
      </section>

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
              <option value="Read Through">Read-through plan</option>
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
      <Footer/>
    </section>
  );
};

export default CreateCommunity;
