import './BookVersion.css';
import { GoTriangleDown } from "react-icons/go";

const BookVersion = () => {

    const API_KEY = "ea9272ba0be86f8024c97d566497f993";

    const getBibleVersions = () => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.addEventListener(`readystatechange`, function () {
                if (this.readyState === this.DONE) {
                    const { data } = JSON.parse(this.responseText);
                    const versions = data.map((data) => {
                        return {
                            name: data.name,
                            id: data.id,
                            abbreviation: data.abbreviation,
                            description: data.description,
                            language: data.language.name,
                        };
                    });
                    resolve(versions);
                }
            });
            xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles`);
            xhr.setRequestHeader(`api-key`, API_KEY);
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send();
        });
    };

    return (
        <div className="BookVersionHolder">
            <div className="Books">
                <p className="BookNameDisplay">Genesis</p>
                <GoTriangleDown className="BookVersionDownArrow" />
            </div>
            <div className="Versions">
                <p className="VersionNameDisplay">NIV</p>
                <GoTriangleDown className="BookVersionDownArrow" />
            </div>
        </div>
    );
};

export default BookVersion;