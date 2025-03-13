import About from '../../pages/About/About';
import Community from '../../pages/Community/Community';
import Read from '../../pages/Read/Read';
import Study from '../../pages/Study/Study';
import './HomeBody.css';
import { Link } from 'react-router-dom';

const HomeBodyCard = (props) => {

    const cardType = props.type;
    let link;
    switch (cardType) {
        case 'about':
            link = (<Link to='/about' element={<About />}>Learn More</Link>);
            break;
        case 'read':
            link = (<Link to='/read' element={<Read />}>Learn More</Link>);
            break;
        case 'study':
            link = (<Link to='/study' element={<Study />}>Learn More</Link>);
            break;
        case 'community':
            link = (<Link to='/community' element={<Community />}>Learn More</Link>);
            break;
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