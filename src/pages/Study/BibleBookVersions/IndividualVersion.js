const IndividualVersion = ({ version }) => {
  const { id, abbreviation, name } = version;

  return (
    <li className="bibleItem">
      <a href={`book.html?version=${id}&abbr=${abbreviation}`}>
        {abbreviation} - {name}
      </a>
    </li>
  );
};

export default IndividualVersion;