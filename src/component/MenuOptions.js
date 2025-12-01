import { Link, useNavigate } from "react-router-dom";
import "./MenuOptions.css";
import { useAuth } from "./context/AuthContext";
import UserMenu from "./UserMenu";

const MenuOptions = ({ page = true, onNavigate }) => {
  const item = page ? "MenuOptionList" : "MenuOptionListPage";

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // async function handleLogout() {
  //   await logout();
  //   onNavigate?.();
  //   navigate("/", { replace: true });
  // }

  return (
    <ul className="MenuOptions">
      <li className={item}>
        <Link to="/" onClick={onNavigate}>HOME</Link>
      </li>

      <li className={item}>
        <Link to="/study" onClick={onNavigate}>STUDY &amp; REFLECT</Link>
      </li>

      {user ? (
        <li className={item}>
          <Link to="/community" onClick={onNavigate}>COMMUNITIES</Link></li>) : 
          <li className={item}><Link to="/community-how" onClick={onNavigate}>COMMUNITIES</Link></li>}

      <li className={item}>
        <Link to="/contact" onClick={onNavigate}>CONTACT</Link>
      </li>

      {!user ? (
        <li className={item}>
          <Link to="/account" onClick={onNavigate}>LOGIN</Link>
        </li>
      ) : (
         <UserMenu itemClass={item} onNavigate={onNavigate} />
      )}
    </ul>
  );
};

export default MenuOptions;
