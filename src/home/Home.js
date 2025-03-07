import Hero from "./homeHero/Hero";
import "./Home.css";
import HomeBody from "./homeBody/HomeBody";
import HomeUpdate from "./homeUpdates/HomeUpdate";

const Home = () => {

    return (
        <div className="Home">
            <Hero />
            <HomeBody />
            <HomeUpdate/>
        </div>
    );
};

export default Home;