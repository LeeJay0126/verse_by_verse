import './VerseDisplay.css';

const VerseDisplay = () => {
    /*
        bookChapterHeader is a combination of Book version
        + Chapter 
    */
    return (
        <section className="DisplaySection">
            <h2 className="bookChapterHeader">
                Book Chapter
            </h2>
            <div className="displayArea">
                display
            </div>
        </section>
    );
};

export default VerseDisplay;