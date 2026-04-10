import { Link, useParams } from "react-router-dom";
import Footer from "../../component/Footer";
import PageHeader from "../../component/PageHeader";
import { featureSectionMap } from "./aboutFeatureData";
import "./About.css";

const AboutFeatureDetail = () => {
  const { featureSlug } = useParams();
  const feature = featureSectionMap.get(featureSlug);

  if (!feature) {
    return (
      <section className="AboutPage">
        <div className="AboutHero AboutHero--detail">
          <PageHeader />
          <div className="AboutHeroContent AboutHeroContent--detail">
            <p className="AboutEyebrow">Feature Walkthrough</p>
            <h1 className="AboutTitle">Feature not found</h1>
            <p className="AboutIntro">
              We could not find that feature walkthrough. You can head back to the main About page and choose a
              different section.
            </p>
            <Link className="AboutBackLink" to="/about">
              Back to About
            </Link>
          </div>
        </div>
        <Footer />
      </section>
    );
  }

  return (
    <section className="AboutPage">
      <div className="AboutHero AboutHero--detail">
        <PageHeader />

        <div className="AboutHeroContent AboutHeroContent--detail">
          <p className="AboutEyebrow">Feature Walkthrough</p>
          <h1 className="AboutTitle">{feature.title}</h1>
          <p className="AboutIntro">{feature.summary}</p>
          <Link className="AboutBackLink" to="/about">
            Back to About
          </Link>
        </div>
      </div>

      <main className="AboutMain">
        <section className="AboutSection">
          <div className="AboutSectionHeading">
            <p className="AboutSectionLabel">Experience Overview</p>
            <h2>{feature.walkthroughTitle}</h2>
            <p>{feature.walkthroughIntro}</p>
          </div>

          <div className="AboutWalkthroughGrid">
            {feature.steps.map((step, index) => (
              <article className="AboutWalkthroughCard" key={step.title}>
                <div className="AboutWalkthroughStepNo">Step {index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="AboutSection">
          <div className="AboutSectionHeading">
            <p className="AboutSectionLabel">Key Outcomes</p>
            <h2>What this feature is trying to accomplish</h2>
          </div>

          <div className="AboutOutcomeCard">
            <ul className="AboutBulletList">
              {feature.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </section>
  );
};

export default AboutFeatureDetail;
