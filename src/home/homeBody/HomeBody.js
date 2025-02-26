import "./HomeBody.css";
import HomeBodyCard from "./HomeBodyCard";

const HomeBody = () => {

    return (
        <section className="HomeBody">
            <div className="HomeBodyCardContainer">
                <HomeBodyCard name={"About"}/>
                <HomeBodyCard name={"About"}/>
                <HomeBodyCard name={"About"}/>
                <HomeBodyCard name={"About"}/>
            </div>
        </section>
    );
};

export default HomeBody;