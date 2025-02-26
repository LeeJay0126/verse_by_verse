import "./HomeBody.css";
import HomeBodyCard from "./HomeBodyCard";

const HomeBody = () => {

    return (
        <section className="HomeBody">
            <div className="HomeBodyCardContainer">
                <HomeBodyCard name={"Study"}/>
            </div>
        </section>
    );
};

export default HomeBody;