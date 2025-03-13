import Header from '../../component/Header';
import './About.css';

const About = () => {

    return (
        <section className='About'>
            <Header />
            <div className='AboutHero'>
                <h1 className ="HeroH1 AboutH1">
                    Welcome to Verse by Verse
                </h1>
            </div>
        </section>
    );
};

export default About;