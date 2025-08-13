import { useState } from 'react';
import './Bible.css';
import BookVersion from './bibleVersions/BibleVersions';
import Verse from './verseDisplay/Verse';

const Bible = () => {
    const [currChapter, setCurrentChapter] = useState("Intro");
    const [currBook, setCurrentBook] = useState("Genesis");


    return (
        <section className="ReadBible">
            <BookVersion
                setChapter={setCurrentChapter}
                book={currBook}
                setBook={setCurrentBook}
            />
            <Verse 
                chapter={currChapter}
                book={currBook}
            />
        </section>
    );
};

export default Bible;