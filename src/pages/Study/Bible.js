import { useState } from 'react';
import './Bible.css';
import BibleVersion from './bibleVersions/BibleVersions';
import Verse from './verseDisplay/Verse';

const Bible = () => {
    const [currChapter, setCurrentChapter] = useState("Intro");
    const [currBook, setCurrentBook] = useState("Genesis");
    const [currVersion, setVersion] = useState('06125adad2d5898a-01');

    return (
        <section className="ReadBible">
            <BibleVersion
                setChapter={setCurrentChapter}
                book={currBook}
                setBook={setCurrentBook}
                currVersionId={currVersion}
                setCurrentVersion={setVersion}
            />
            <Verse
                chapter={currChapter}
                book={currBook}
            />
        </section>
    );
};

export default Bible;