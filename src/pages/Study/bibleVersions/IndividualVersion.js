import "./IndividualVersion.css";

const IndividualVersion = (props) => {

  const clickHandler = () =>{
    props.chVer(props.version.abbreviation);
    props.setId(props.id);
  }

  return (
    // <li className="bibleItem" onClick={()=>chVer(version.id)}>
    <li className="bibleItem" onClick={clickHandler}>
      <p>
        {props.version.abbreviation} - {props.version.name}
      </p>
    </li>
  );
};

export default IndividualVersion;
