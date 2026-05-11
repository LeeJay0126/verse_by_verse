import { Link } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
    return (
        <div className="HeroSection">
            <h1 className="HeroH1">
                Explore the Bible
            </h1>
            <h2 className="HeroH2">
                One Verse At a Time
            </h2>
            <Link to="/about" className="HeroButton">
                GET STARTED
            </Link>
        </div>
    );
};

export default Hero;
