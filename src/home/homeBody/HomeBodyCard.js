import './HomeBody.css';

const HomeBodyCard = (props) => {

    return (
        <section className='HBC'>
            <h3>{props.name}</h3>
            <div className='HomeBodyCard'>
                <h3>
                    Read the Bible
                </h3>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                </p>
            </div>
        </section>
    );
};

export default HomeBodyCard;