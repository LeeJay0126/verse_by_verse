import './BibleHeader.css';
import PageLogo from '../../component/PageLogo';
import MenuOptions from '../../component/MenuOptions';

const BibleHeader = () => {

    return (
        <header className='BibleHeader'>
            <PageLogo/>
            <MenuOptions/>
        </header>
    );
};

export default BibleHeader;