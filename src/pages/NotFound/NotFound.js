import { Link, useLocation } from "react-router-dom";
import { FaChurch } from "react-icons/fa";
import PageHeader from "../../component/PageHeader";
import Footer from "../../component/Footer";
import "./NotFound.css";

export default function NotFound() {
  const location = useLocation();
  const attemptedPath = location.state?.from;

  return (
    <section className="NotFoundPage">
      <PageHeader />

      <main className="NotFoundMain" aria-labelledby="not-found-title">
        <div className="NotFoundCard">
          <div className="NotFoundIconWrap" aria-hidden="true">
            <span className="NotFoundGlow" />
            <FaChurch className="NotFoundIcon" />
          </div>

          <p className="NotFoundEyebrow">404 • path not found</p>
          <h1 id="not-found-title">This pew is empty.</h1>
          <p className="NotFoundCopy">
            We could not find that page. It may have moved, or the link may have taken a tiny
            detour through the fellowship hall.
          </p>

          {attemptedPath ? (
            <p className="NotFoundPath">
              Tried to open <span>{attemptedPath}</span>
            </p>
          ) : null}

          <div className="NotFoundActions">
            <Link className="NotFoundPrimary" to="/">
              Go Home
            </Link>
            <Link className="NotFoundSecondary" to="/community-how">
              Explore Community
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </section>
  );
}
