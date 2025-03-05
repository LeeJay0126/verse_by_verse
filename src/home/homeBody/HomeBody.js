import "./HomeBody.css";
import HomeBodyCard from "./HomeBodyCard";

const HomeBody = () => {

    const CardList = [
        ["About", "AboutCard", "Verse by Verse", "Verse by Verse is a platform for reading, studying, and reflecting on the Bible, both individually and in a community. It provides tools for deepening spiritual growth through Scripture, study resources, and group discussions."],
        ["Read the Bible", "ReadCard", "Read the Bible", "Explore the Bible in multiple languages with a clean, user-friendly interface designed for an immersive reading experience. Easily navigate through chapters and verses to engage with Scripture at your own pace."],
        ["Study & Reflect", "StudyCard", "Study the Bible", "Deepen your understanding of Scripture through guided study and personal reflection. Engage with thought-provoking questions and insights that help you apply biblical teachings to your life."],
        ["Community", "CommunityCard", "Join & Create", "Join or create a community to study and discuss the Bible with others. Share insights, ask questions, and grow in faith together through meaningful conversations."],
    ];

    const Cards = (
        CardList.map((item) =>
            <HomeBodyCard
                name={item[0]}
                image={item[1]}
                title={item[2]}
                desc={item[3]}
                key={item[0]}
            />
        )
    );

    return (
        <section className="HomeBody">
            <div className="HomeBodyCardContainer">
               {Cards}
            </div>
        </section>
    );
};

export default HomeBody;