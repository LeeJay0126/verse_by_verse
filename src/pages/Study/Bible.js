import { useState } from 'react';
import './Bible.css';
import BibleVersion from './bibleVersions/BibleVersions';
import Verse from './verseDisplay/Verse';

const Bible = () => {
    const [currChapterId, setCurrentChapterId] = useState(null); // e.g., "GEN.3"
    const [currBook, setCurrBook] = useState({ id: null, name: "" });
    const [currVersion, setVersion] = useState('06125adad2d5898a-01');
    return (
        <section className="ReadBible">
            <BibleVersion
                setChapter={setCurrentChapterId}
                book={currBook}
                setBook={setCurrBook}
                currVersionId={currVersion}
                setCurrentVersion={setVersion}
            />
            <Verse
                chapterId={currChapterId}
                currVersionId={currVersion}
                book={currBook}
            />
        </section>
    );
};

export default Bible;