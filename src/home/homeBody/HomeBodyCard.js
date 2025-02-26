import './HomeBody.css';

const HomeBodyCard = (props) => {

    return (
        <section className='HBC'>
            <h3>{props.name}</h3>
            <div className='HomeBodyCard'>
            </div>
        </section>
    );
};

export default HomeBodyCard;