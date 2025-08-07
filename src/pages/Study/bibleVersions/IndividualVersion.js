import "./IndividualVersion.css";

const IndividualVersion = ({ version, chVer }) => {
  const {abbreviation, name } = version;

  return (
    <li className="bibleItem" onClick={()=>chVer(abbreviation)}>
      <p>
        {abbreviation} - {name}
      </p>
    </li>
  );
};

export default IndividualVersion;
