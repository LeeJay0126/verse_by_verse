import "./Logo.css";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <p className="Logo">
      <Link to="/">Verse by Verse</Link>
    </p>
  );
};

export default Logo;
