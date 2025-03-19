import Home from '../home/Home';
import About from '../pages/About/About';
import Study from '../pages/Study/Study';
import Community from '../pages/Community/Community';
import Read from '../pages/Read/Read';
import Account from '../pages/Account/Account';
import './MenuOptions.css';
import { Link } from 'react-router-dom';
import Contact from '../pages/Contact/Contact';

/* TODO
Have the MenuOption list to take props

*/
const MenuOptions = (props) => {

    return (
        <ul className='MenuOptions'>
            <li className={props.page ? 'MenuOptionList' : 'MenuOptionListPage'}><Link to='/' element={<Home />}>HOME</Link></li>
            <li className={props.page ? 'MenuOptionList' : 'MenuOptionListPage'}><Link to='/about' element={<About />}>ABOUT</Link></li>
            <li className={props.page ? 'MenuOptionList' : 'MenuOptionListPage'}><Link to='/study' element={<Study />}> STUDY & REFLECT </Link></li>
            <li className={props.page ? 'MenuOptionList' : 'MenuOptionListPage'}><Link to='/community' element={<Community />}>COMMUNITIES</Link></li>
            <li className={props.page ? 'MenuOptionList' : 'MenuOptionListPage'}><Link to='/contact' element={<Contact />}>CONTACT</Link></li>
            <li className={props.page ? 'MenuOptionList' : 'MenuOptionListPage'}><Link to='/account' element={<Account />}>ACCOUNT</Link></li>
        </ul>
    );
};

export default MenuOptions;