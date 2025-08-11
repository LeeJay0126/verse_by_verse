import './Bible.css';
import BookVersion from './bibleVersions/BibleVersions';
import VerDisplay from './verseDisplay/VerseDisplay';

const Bible = () => {

    return (
        <section className="ReadBible">
            <BookVersion/>
            <VerDisplay/>
        </section>
    );
};

export default Bible;