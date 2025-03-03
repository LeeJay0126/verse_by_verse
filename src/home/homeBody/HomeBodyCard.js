import './HomeBody.css';

const HomeBodyCard = (props) => {

    return (
        <div className='HBC'>
            <h3>{props.name}</h3>
            <div className='HomeBodyCard'>
                <section className={`CardImage ${props.image}`}></section>
                <section className='HBCBody'>
                    <h3>
                        Read the Bible
                    </h3>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </section>
            </div >
        </div >
    );
};

export default HomeBodyCard;