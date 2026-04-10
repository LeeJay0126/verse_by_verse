import "./HomeBody.css";
import { Link } from "react-router-dom";

const HomeBodyCard = (props) => {

    const cardType = props.type;
    let link = null;

    switch (cardType) {
        case "about":
            link = <Link to="/about">Learn More</Link>;
            break;
        case "read":
        case "study":
            link = <Link to="/study">Learn More</Link>;
            break;
        case "community":
            link = <Link to="/community">Learn More</Link>;
            break;
        default:
            link = null;
    }

    return (
        <div className='HBC'>
            <h3>{props.name}</h3>
            <div className='HomeBodyCard'>
                <section className={`CardImage ${props.image}`}></section>
                <section className='HBCBody'>
                    <h3>
                        {props.title}
                    </h3>
                    <p>
                        {props.desc}
                    </p>
                    <button className='CardMore'>
                        {link}
                    </button>
                </section>
            </div >
        </div >
    );
};

export default HomeBodyCard;
