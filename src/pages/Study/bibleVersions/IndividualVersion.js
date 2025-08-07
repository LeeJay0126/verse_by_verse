import "./IndividualVersion.css";

const IndividualVersion = ({ version }) => {
  const {abbreviation, name } = version;

  return (
    <li className="bibleItem">
      <p>
        {abbreviation} - {name}
      </p>
    </li>
  );
};

export default IndividualVersion;
