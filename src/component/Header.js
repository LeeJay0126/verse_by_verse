import { useEffect, useRef } from "react";
import "./Header.css";
import Logo from "./Logo";
import MenuOptions from "./MenuOptions";

const Header = () => {
  const toggleRef = useRef(null);

  // Close top sheet after nav
  const closeMenu = () => {
    if (toggleRef.current) toggleRef.current.checked = false;
  };

  // Lock/unlock page scroll when menu is open (prevents background scroll)
  useEffect(() => {
    const el = toggleRef.current;
    const onChange = () => {
      const open = !!el?.checked;
      document.documentElement.style.overflow = open ? "hidden" : "";
    };
    el?.addEventListener("change", onChange);
    return () => {
      document.documentElement.style.overflow = "";
      el?.removeEventListener("change", onChange);
    };
  }, []);

  const isExpanded = !!toggleRef.current?.checked;

  return (
    <header className="Header">
      <Logo />

      {/* Desktop inline menu (hidden on mobile in CSS) */}
      <nav className="MenuInline" aria-label="Primary">
        <MenuOptions page={true} />
      </nav>

      {/* Controller MUST come before label + sheet for the CSS selector */}
      <input
        type="checkbox"
        id="menu-toggle"
        className="menu-toggle"
        ref={toggleRef}
        aria-label="Toggle navigation menu"
      />

      {/* Hamburger (shown on mobile in CSS) */}
      <label
        htmlFor="menu-toggle"
        className="Hamburger"
        aria-controls="top-sheet"
        aria-expanded={isExpanded}
      >
        <span></span><span></span><span></span>
      </label>

      {/* Top sheet (mobile) */}
      <nav className="MenuPanel SideSheet" id="top-sheet" aria-label="Primary">
        <MenuOptions page={true} onNavigate={closeMenu} />
      </nav>

      {/* Backdrop (click to close) */}
      <label htmlFor="menu-toggle" className="MenuBackdrop" aria-hidden="true" />
    </header>
  );
};

export default Header;
