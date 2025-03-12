import Hero from "./homeHero/Hero";
import "./Home.css";
import HomeBody from "./homeBody/HomeBody";
import HomeUpdate from "./homeUpdates/HomeUpdate";
import Footer from "../component/Footer";
import Header from "../component/Header";

const Home = () => {

    return (
        <div className="Home">
            <header className="App-header">
                <Header />
            </header>
            <Hero />
            <HomeBody />
            {/* <HomeUpdate/> */}
            <Footer />
        </div>
    );
};

export default Home;