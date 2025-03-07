import Hero from "./homeHero/Hero";
import "./Home.css";
import HomeBody from "./homeBody/HomeBody";
import HomeUpdate from "./homeUpdates/HomeUpdate";
import Footer from "../component/Footer";

const Home = () => {

    return (
        <div className="Home">
            <Hero />
            <HomeBody />
            <HomeUpdate/>
            <Footer/>
        </div>
    );
};

export default Home;