import './Bible.css';
import BookVersion from './bibleVersions/BibleVersions';

const Bible = () => {

    return (
        <section className="ReadBible">
            <BookVersion/>
        </section>
    );
};

export default Bible;