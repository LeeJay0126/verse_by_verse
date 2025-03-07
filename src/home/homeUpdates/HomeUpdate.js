import './HomeUpdate.css';
import phoneMock from '../../component/images/mockupPhones/apple-iphone-15-black-mockup/Verse2-left.png';

const HomeUpdate = () => {

    return (
        <section className='HomeUpdate'>
            <h2 className='UpdateHeader'>
                Take Verse by Verse on the go
            </h2>
            <img className="UpdatePhoneMock" alt='phone mockup for update section' src={phoneMock}/>
        </section>
    );
};

export default HomeUpdate;