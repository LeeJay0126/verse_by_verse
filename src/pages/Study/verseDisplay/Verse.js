import './Verse.css';

const Verse = ({chapter, book}) => {
    /*
        bookChapterHeader is a combination of Book version
        + Chapter 
    */
    return (
        <section className="DisplaySection">
            <h2 className="bookChapterHeader">
                {book} {chapter}
            </h2>
            <div className="displayArea">
                display
            </div>
        </section>
    );
};

export default Verse;