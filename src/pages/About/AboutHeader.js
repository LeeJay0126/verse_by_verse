import './AboutHeader.css';
import PageLogo from '../../component/PageLogo';
import MenuOptions from '../../component/MenuOptions';

const AboutHeader = () => {
    return (
        <header className='AboutHeader'>
            <PageLogo/>
            <MenuOptions page={false}/>
        </header>
    );
};

export default AboutHeader;