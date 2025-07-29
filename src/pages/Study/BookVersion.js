import './BookVersion.css';
import { GoTriangleDown } from "react-icons/go";
import { useState } from 'react';

const BookVersion = () => {

    const [book, setBook] = useState("Genesis");
    const [chapter, setChapter] = useState("Intro");

    return (
        <div className="BookVersionHolder">
            <div className="Books">
                <p className="BookNameDisplay">Genesis</p>
                <GoTriangleDown className="BookVersionDownArrow"/>
            </div>
            <div className="Versions">
                <p className="VersionNameDisplay">NIV</p>
                <GoTriangleDown className="BookVersionDownArrow"/>
            </div>
        </div>
    );
};

export default BookVersion;