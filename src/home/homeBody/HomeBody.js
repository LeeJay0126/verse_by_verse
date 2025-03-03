import "./HomeBody.css";
import HomeBodyCard from "./HomeBodyCard";

const HomeBody = () => {

    return (
        <section className="HomeBody">
            <div className="HomeBodyCardContainer">
                <HomeBodyCard name={"About"}/>
                <HomeBodyCard name={"Read the Bible"}/>
                <HomeBodyCard name={"Study & Reflect"}/>
                <HomeBodyCard name={"Community"}/>
            </div>
        </section>
    );
};

export default HomeBody;