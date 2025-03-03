import "./HomeBody.css";
import HomeBodyCard from "./HomeBodyCard";

const HomeBody = () => {

    return (
        <section className="HomeBody">
            <div className="HomeBodyCardContainer">
                <HomeBodyCard name={"About"} image={"AboutCard"}/>
                <HomeBodyCard name={"Read the Bible"} image={"ReadCard"}/>
                <HomeBodyCard name={"Study & Reflect"} image={"StudyCard"}/>
                <HomeBodyCard name={"Community"} image={"CommunityCard"}/>
            </div>
        </section>
    );
};

export default HomeBody;