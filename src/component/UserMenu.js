// src/component/UserMenu.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import { useNotifications } from "./context/NotificationContext";
import "./MenuOptions.css";

const UserMenu = ({ itemClass, onNavigate }) => {
  const { user, logout } = useAuth();
  const { hasUnread, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    setOpen(false);
    onNavigate?.();
    navigate("/", { replace: true });
  }

  function go(path) {
    setOpen(false);
    onNavigate?.();
    navigate(path);
  }

  if (!user) return null;

  return (
    <li className={`${itemClass} UserMenuWrapper`} ref={menuRef}>
      <button
        type="button"
        className="UserMenuButton"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="UserIconWrapper">
          <FaUserCircle className="UserIcon" />
          {hasUnread && <span className="NotificationDot" aria-hidden="true" />}
        </div>
      </button>

      {open && (
        <div className="UserDropdown">
          <button
            type="button"
            className="UserDropdownItem"
            onClick={() => go("/notifications")}
          >
            Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>
          <button
            type="button"
            className="UserDropdownItem"
            onClick={() => go("/profile")}
          >
            Profile
          </button>
          <button
            type="button"
            className="UserDropdownItem UserDropdownItem--danger"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      )}
    </li>
  );
};

export default UserMenu;
