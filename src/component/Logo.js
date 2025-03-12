import Home from '../home/Home';
import './Logo.css';
import { Link } from 'react-router-dom';

const Logo = () => {

    return (
        <p className="Logo">
            <Link to="/" element={<Home />}>
                Verse by Verse
            </Link>
        </p>
    );
};

export default Logo;