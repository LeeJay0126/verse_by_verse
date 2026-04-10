import { useEffect, useState } from "react";
import "./MobileUnavailable.css";

const MOBILE_QUERY = "(max-width: 768px)";

const getIsMobile = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(MOBILE_QUERY).matches;
};

export const useIsMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isMobile;
};

const MobileUnavailable = () => {
  return (
    <section className="MobileUnavailable">
      <div className="MobileUnavailableCard">
        <div className="MobileUnavailableIllustration" aria-hidden="true">
          <svg viewBox="0 0 320 240" role="img">
            <title>Cartoon Bible illustration</title>
            <ellipse cx="160" cy="210" rx="88" ry="16" fill="rgba(126, 86, 47, 0.18)" />
            <circle cx="78" cy="56" r="18" fill="#fff7ea" />
            <circle cx="102" cy="48" r="14" fill="#fff7ea" />
            <circle cx="125" cy="58" r="18" fill="#fff7ea" />
            <circle cx="238" cy="60" r="16" fill="#fff7ea" />
            <circle cx="258" cy="50" r="13" fill="#fff7ea" />
            <circle cx="278" cy="60" r="16" fill="#fff7ea" />
            <path d="M140 26c8 12 8 21 0 31c-8-10-8-19 0-31Z" fill="#f8d88c" />
            <path d="M140 24v34" stroke="#d5a84c" strokeWidth="4" strokeLinecap="round" />
            <path
              d="M86 96c0-18 14-32 32-32h84c18 0 32 14 32 32v70c0 18-14 32-32 32h-84c-18 0-32-14-32-32Z"
              fill="#d39a5f"
            />
            <path
              d="M104 90c0-14 11-25 25-25h62c14 0 25 11 25 25v72c0 14-11 25-25 25h-62c-14 0-25-11-25-25Z"
              fill="#8a5a33"
            />
            <path d="M160 88v56" stroke="#f6e8c9" strokeWidth="10" strokeLinecap="round" />
            <path d="M132 116h56" stroke="#f6e8c9" strokeWidth="10" strokeLinecap="round" />
            <path
              d="M110 164c10-10 24-16 50-16s40 6 50 16v25H110Z"
              fill="#fff6e4"
            />
            <circle cx="134" cy="122" r="6" fill="#2d2018" />
            <circle cx="186" cy="122" r="6" fill="#2d2018" />
            <path d="M140 142c10 10 30 10 40 0" stroke="#2d2018" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M107 153c-10 8-16 16-20 27" stroke="#8a5a33" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M213 153c10 8 16 16 20 27" stroke="#8a5a33" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M132 198v-20" stroke="#8a5a33" strokeWidth="8" strokeLinecap="round" />
            <path d="M188 198v-20" stroke="#8a5a33" strokeWidth="8" strokeLinecap="round" />
            <path
              d="M255 102c8-10 16-10 24 0c-8 10-16 10-24 0Z"
              fill="#fff7ea"
            />
            <path
              d="M273 98c10-10 18-10 26 0c-8 10-16 10-26 0Z"
              fill="#fff7ea"
            />
          </svg>
        </div>

        <p className="MobileUnavailableEyebrow">Verse By Verse</p>
        <h1 className="MobileUnavailableTitle">Mobile view unavailable</h1>
        <p className="MobileUnavailableMessage">
          Our app is coming.
          <br />
          And it will be worth the wait.
        </p>
        <p className="MobileUnavailableNote">
          For now, please visit on a desktop or larger screen.
        </p>
      </div>
    </section>
  );
};

export default MobileUnavailable;
