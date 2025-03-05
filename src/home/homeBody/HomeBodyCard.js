import './HomeBody.css';

const HomeBodyCard = (props) => {

    return (
        <div className='HBC'>
            <h3>{props.name}</h3>
            <div className='HomeBodyCard'>
                <section className={`CardImage ${props.image}`}></section>
                <section className='HBCBody'>
                    <h3>
                        {props.title}
                    </h3>
                    <p>
                        {props.desc}
                    </p>
                </section>
            </div >
        </div >
    );
};

export default HomeBodyCard;