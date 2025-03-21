import './BibleHeader.css';
import '../../component/Header.css';
import PageLogo from '../../component/PageLogo';
import MenuOptions from '../../component/MenuOptions';

const BibleHeader = () => {

    return (
        <header className='BibleHeader'>
            <PageLogo/>
            <MenuOptions page={false}/>
        </header>
    );
};

export default BibleHeader;