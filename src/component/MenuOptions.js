import { Link } from "react-router-dom";
import "./MenuOptions.css";

const MenuOptions = ({ page = true, onNavigate }) => {
  const item = page ? "MenuOptionList" : "MenuOptionListPage";

  return (
    <ul className="MenuOptions">
      <li className={item}><Link to="/" onClick={onNavigate}>HOME</Link></li>
      <li className={item}><Link to="/about" onClick={onNavigate}>ABOUT</Link></li>

      {/* Dropdown using <details> (native, a11y-friendly) */}
      <li className={`${item} has-submenu`}>
        <details>
          <summary>STUDY &amp; REFLECT</summary>
          <ul className="Submenu">
            <li><Link to="/study" onClick={onNavigate}>All Studies</Link></li>
            <li><Link to="/study/old-testament" onClick={onNavigate}>Old Testament</Link></li>
            <li><Link to="/study/new-testament" onClick={onNavigate}>New Testament</Link></li>
          </ul>
        </details>
      </li>

      <li className={item}><Link to="/community" onClick={onNavigate}>COMMUNITIES</Link></li>
      <li className={item}><Link to="/contact" onClick={onNavigate}>CONTACT</Link></li>
      <li className={item}><Link to="/account" onClick={onNavigate}>ACCOUNT</Link></li>
    </ul>
  );
};

export default MenuOptions;
