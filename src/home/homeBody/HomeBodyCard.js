import Community from '../../pages/Community/Community';
import Read from '../../pages/Read/Read';
import Study from '../../pages/Study/Study';
import Home from '../Home';
import './HomeBody.css';
import { Link } from 'react-router-dom';

const HomeBodyCard = (props) => {

    //About Page removed. Maybe add an about section to show how the web app should be used
    //under the cards section and add a ref link to it to slide the page down to address it
    const cardType = props.type;
    let link;
    switch (cardType) {
        case 'about':
            link = (<Link to='/' element={<Home/>}>Learn More</Link>);
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