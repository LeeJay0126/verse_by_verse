
const IndividualVersion = (props) => {

    return (
        <li className="bibleItem">
            <a href={`book.html?version=${props.id}&abbr=${props.abbreviation}`}>
                <abbr class="bible-version-abbr" title={`${props.name}`}>{props.abbreviation}</abbr>
                <span>
                    <span class="bible-version-name">{props.name
                    }</span>
                    {props.description ? '<span className="bible-version-desc">' + version.description + "</span>" : ""}
                </span>
            </a>
        </li >
    );

};

export default IndividualVersion;