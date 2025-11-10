import "./IndividualVersion.css";

const IndividualVersion = ({ version, id, chVer, setId, setVis }) => {
  const clickHandler = () => {
    const abbr = version.abbreviation || version.id;
    if (!abbr || !id) return;

    chVer(abbr);     // e.g. "ASV" / "KOR"
    setId(id);       // e.g. api.bible id / "kor"
    setVis(false);
  };

  return (
    <li className="bibleItem" onClick={clickHandler}>
      <p>
        {version.abbreviation || version.id} - {version.name}
      </p>
    </li>
  );
};

export default IndividualVersion;
