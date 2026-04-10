import { Link } from "react-router-dom";
import Footer from "../../component/Footer";
import PageHeader from "../../component/PageHeader";
import "./About.css";
import { featureSections } from "./aboutFeatureData";

const platformThemes = [
  {
    title: "Read Scripture Intentionally",
    text: "Verse By Verse is built around slowing down the reading experience so users can stay close to the text instead of skimming past it.",
  },
  {
    title: "Record Insight While It Is Fresh",
    text: "Notes and guided reflection flows help users capture observations, questions, and applications while studying.",
  },
  {
    title: "Reflect Personally",
    text: "The product encourages personal engagement, not just consumption, so each page supports some form of thoughtful response.",
  },
  {
    title: "Share in Community",
    text: "Community spaces turn individual study into conversation through posts, replies, structured Bible study shares, and collaboration.",
  },
];

const About = () => {
  return (
    <section className="AboutPage">
      <div className="AboutHero">
        <PageHeader />

        <div className="AboutHeroContent">
          <p className="AboutEyebrow">Platform Guide</p>
          <h1 className="AboutTitle">About Verse By Verse</h1>
          <p className="AboutIntro">
            Verse By Verse is a Scripture-centered platform designed to help people read the Bible carefully,
            capture what they are learning, and share that growth with others. This page documents the app in a
            feature-based way so each major area is easy to understand at a glance.
          </p>
        </div>
      </div>

      <main className="AboutMain">
        <section className="AboutSection">
          <div className="AboutSectionHeading">
            <p className="AboutSectionLabel">Core Experience</p>
            <h2>What the platform is designed to help people do</h2>
          </div>

          <div className="AboutThemeGrid">
            {platformThemes.map((theme) => (
              <article className="AboutThemeCard" key={theme.title}>
                <h3>{theme.title}</h3>
                <p>{theme.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="AboutSection">
          <div className="AboutSectionHeading">
            <p className="AboutSectionLabel">Page Guide</p>
            <h2>What each page does</h2>
            <p>
              Each section below explains the purpose of a page or page group, the route it serves, and the
              feature value it adds to the overall product.
            </p>
          </div>

          <div className="AboutFeatureList">
            {featureSections.map((section) => (
              <article className="AboutFeatureCard" key={section.title}>
                <div className="AboutFeatureHeader">
                  <div>
                    <h3>{section.title}</h3>
                  </div>
                  <Link className="AboutBadge AboutBadgeLink" to={`/about/${section.slug}`}>
                    Feature View
                  </Link>
                </div>

                <div className="AboutSummaryCard">
                  <p className="AboutSummary">{section.summary}</p>
                </div>

                <ul className="AboutBulletList">
                  {section.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="AboutSection AboutSection--closing">
          <div className="AboutClosingCard">
            <p className="AboutSectionLabel">Product Direction</p>
            <h2>A feature set built around depth, clarity, and community</h2>
            <p>
              The app is strongest when these features work together: reading leads to notes, notes lead to
              reflection, and reflection leads to meaningful community discussion. This About page is meant to
              make that product flow obvious for users, teammates, and future contributors.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </section>
  );
};

export default About;
