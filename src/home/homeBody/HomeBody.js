import "./HomeBody.css";
import HomeBodyCard from "./HomeBodyCard";

const HomeBody = () => {

    const CardList = [
        ["About", "AboutCard", "Verse by Verse", "Verse by Verse is a biblical platform designed to help users engage deeply with Scripture. It provides tools for reading the Bible in multiple languages, studying and reflecting on its teachings, and connecting with others in a faith-based community. Whether you're exploring passages individually or discussing insights with a group, Verse by Verse fosters a space for spiritual growth, learning, and meaningful conversations."],
    ];

    return (
        <section className="HomeBody">
            <div className="HomeBodyCardContainer">
                <HomeBodyCard name={"About"} image={"AboutCard"} title={"Verse by Verse"} desc={"Verse by Verse is a biblical platform designed to help users engage deeply with Scripture. It provides tools for reading the Bible in multiple languages, studying and reflecting on its teachings, and connecting with others in a faith-based community. Whether you're exploring passages individually or discussing insights with a group, Verse by Verse fosters a space for spiritual growth, learning, and meaningful conversations."}/>
                <HomeBodyCard name={"Read the Bible"} image={"ReadCard"}/>
                <HomeBodyCard name={"Study & Reflect"} image={"StudyCard"}/>
                <HomeBodyCard name={"Community"} image={"CommunityCard"}/>
            </div>
        </section>
    );
};

export default HomeBody;