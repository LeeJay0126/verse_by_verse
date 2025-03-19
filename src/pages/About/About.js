import './About.css';
import AboutHeader from './AboutHeader';

const About = () => {

    return (
        <section className='About'>
            <div className='AboutHero'>
                <AboutHeader />
                <h1 className="HeroH1 AboutH1">
                    Welcome to Verse by Verse
                </h1>
            </div>
        </section>
    );
};

export default About;