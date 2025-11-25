import { Link, useNavigate } from "react-router-dom";
import "./MenuOptions.css";
import { useAuth } from "./context/AuthContext"; // adjust path if needed

const MenuOptions = ({ page = true, onNavigate }) => {
  const item = page ? "MenuOptionList" : "MenuOptionListPage";

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    onNavigate?.();
    navigate("/", { replace: true });
  }

  return (
    <ul className="MenuOptions">
      <li className={item}>
        <Link to="/" onClick={onNavigate}>HOME</Link>
      </li>

      <li className={item}>
        <Link to="/study" onClick={onNavigate}>STUDY &amp; REFLECT</Link>
      </li>

      <li className={item}>
        <Link to="/community" onClick={onNavigate}>COMMUNITIES</Link>
      </li>

      {/* After development, we should hide community tab when user is not logged in */}
      {/* {user ? (
        <li className={item}>
          <Link to="/community" onClick={onNavigate}>COMMUNITIES</Link>
        </li>) : <></>} */}

      <li className={item}>
        <Link to="/contact" onClick={onNavigate}>CONTACT</Link>
      </li>

      {!user ? (
        <li className={item}>
          <Link to="/account" onClick={onNavigate}>LOGIN</Link>
        </li>
      ) : (
        <li className={item}>
          <div className="logout-btn" onClick={handleLogout}>
            LOG OUT
          </div>
        </li>
      )}
    </ul>
  );
};

export default MenuOptions;
