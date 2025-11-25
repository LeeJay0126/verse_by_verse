import './PageHeader.css';
import PageLogo from './PageLogo';
import MenuOptions from './MenuOptions';

const PageHeader = () => {

    return (
        <header className='PageHeader'>
            <PageLogo />
            <MenuOptions page={false} />
        </header>
    );
};

export default PageHeader;