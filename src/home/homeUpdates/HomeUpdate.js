import './HomeUpdate.css';
import phoneMock from '../../component/images/mockupPhones/apple-iphone-15-black-mockup/Verse2-left.png';

const HomeUpdate = () => {

    return (
        <section className='HomeUpdate'>
            <h2 className='UpdateHeader'>
                UPCOMING UPDATE
            </h2>
            <div className='UpdateFlex'>
                <div className='UpdateDesc'>
                    <h3 className='UpdateDescHeader'>
                        Take Verse by Verse on the go!
                    </h3>
                </div>
                <img className="UpdatePhoneMock" alt='phone mockup for update section' src={phoneMock} />
            </div>
        </section>
    );
};

export default HomeUpdate;