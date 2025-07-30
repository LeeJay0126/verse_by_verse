import { useState, useEffect } from "react";
import getBibleVersions from "./GetBibleVersions";
import IndividualVersion from "./IndividualVersion";
import IndividualVersionHeader from "./IndividualVersionHeader";
import sortVersionsByLanguage from "./SortVersionsByLanguage";

const VersionList = () => {
  const [versionsByLanguage, setVersionsByLanguage] = useState({});

  useEffect(() => {
    getBibleVersions.then((bibleVersionList) => {
      const sorted = sortVersionsByLanguage(bibleVersionList);
      setVersionsByLanguage(sorted);
    });
  }, []);

  return (
    <div>
      {Object.entries(versionsByLanguage).map(([language, versions]) => (
        <div key={language}>
          <IndividualVersionHeader language={language} />
          {versions.map((version) => (
            <IndividualVersion key={version.id} version={version} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default VersionList;