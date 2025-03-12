import Home from '../home/Home';
import './MenuOptions.css';
import { Link } from 'react-router-dom';

const MenuOptions = () => {

    return (
        <ul className='MenuOptions'>
            <li className='MenuOptionList'><Link to='/' element={<Home/>}>HOME</Link></li>
            <li className='MenuOptionList'>ABOUT</li>
            <li className='MenuOptionList'>STUDY & REFLECT</li>
            <li className='MenuOptionList'>COMMUNITIES</li>
            <li className='MenuOptionList'>CONTACT</li>
            <li className='MenuOptionList'>ACCOUNT</li>
        </ul>
    );
};

export default MenuOptions;