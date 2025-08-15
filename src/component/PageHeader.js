import './PageHeader.css';
import './Header.css';
import PageLogo from './PageLogo';
import MenuOptions from './MenuOptions';

const PageHeader = () => {

    return (
        <header className='Header PageHeader'>
            <PageLogo />
            <MenuOptions page={false} />
        </header>
    );
};

export default PageHeader;