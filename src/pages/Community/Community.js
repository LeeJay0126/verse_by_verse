import PageHeader from '../../component/PageHeader';
import './Community.css';
import CommunityBody from './CommunityBody';

const Community = () => {

    return (
        <section className='Community'>
            <div className='CommunityHero'>
                <PageHeader />
                <h1 className="CommunityHeader">Study Scripture Together,</h1>
                <h1 className="CommunityHeader">Verse by Verse</h1>
                <h2 className="CommunityH2">
                    Join communities that read, discuss, and record insights in real time.
                </h2>
                <div className='buttonContainer'>
                    <button className='communityButton'>
                        Browse Communities
                    </button>
                    <button className='communityButton'>
                        Create a Community
                    </button>
                </div>
                <h2 className="CommunityH3">
                    Share memos, comment on verses, and walk through Scripture together
                </h2>
            </div>
            <CommunityBody/>
        </section>
    );
};

export default Community;