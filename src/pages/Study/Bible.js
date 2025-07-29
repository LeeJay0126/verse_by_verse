import './Bible.css';
import BookVersion from './BibleBookVersions/BookVersion';

const Bible = () => {

    return (
        <section className="ReadBible">
            <BookVersion/>
        </section>
    );
};

export default Bible;