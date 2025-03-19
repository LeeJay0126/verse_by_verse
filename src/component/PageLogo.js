import Home from "../home/Home";
import './PageLogo.css';
import { Link } from 'react-router-dom';

const Logo = () => {

    return (
        <p className="PageLogo">
            <Link to="/" element={<Home />}>
                Verse by Verse
            </Link>
        </p>
    );
};

export default Logo;