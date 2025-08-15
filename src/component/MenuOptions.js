import { Link } from "react-router-dom";
import "./MenuOptions.css";

const MenuOptions = ({ page = true, onNavigate }) => {
  const item = page ? "MenuOptionList" : "MenuOptionListPage";

  return (
    <ul className="MenuOptions">
      <li className={item}><Link to="/" onClick={onNavigate}>HOME</Link></li>
      <li className={`${item}`}><Link to="/study" onClick={onNavigate}>STUDY &amp; REFLECT</Link>  </li>
      <li className={item}><Link to="/community" onClick={onNavigate}>COMMUNITIES</Link></li>
      <li className={item}><Link to="/contact" onClick={onNavigate}>CONTACT</Link></li>
      <li className={item}><Link to="/account" onClick={onNavigate}>ACCOUNT</Link></li>
    </ul >
  );
};

export default MenuOptions;
