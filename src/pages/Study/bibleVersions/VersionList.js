import { useEffect, useState } from "react";
import getBibleVersions from "./GetBibleVersions";
import IndividualVersion from "./IndividualVersion";
import IndividualVersionHeader from "./IndividualVersionHeader";
import sortVersionsByLanguage from "./SortVersionsByLanguage";

const VersionList = (props) => {
  const [versionsByLanguage, setVersionsByLanguage] = useState({});

  // Allowed abbreviations
  const allowedAbbreviations = ["ASV", "BSB", "engKJV", "WEB", "FBV"];

  useEffect(() => {
    getBibleVersions.then((bibleVersionList) => {
      const sorted = sortVersionsByLanguage(bibleVersionList);
      setVersionsByLanguage(sorted);
    });
  }, []);

  const KorVersion = {
    abbreviation: "KOR",
    name: "Korean 한국어 성경",
  };

  // Lowercase filter text for case-insensitive search
  const filterLower = (props.filterText || "").toLowerCase();

  return (
    <div>
      {Object.entries(versionsByLanguage)
        .filter(([language]) => language === "English")
        .map(([language, versions]) => {
          // Filter allowed abbreviations
          let filtered = versions.filter((version) =>
            allowedAbbreviations.includes(version.abbreviation || version.id)
          );

          // Apply input filter: filter name or abbreviation includes the typed text
          if (filterLower) {
            filtered = filtered.filter((version) =>
              (version.name || "")
                .toLowerCase()
                .includes(filterLower) ||
              (version.abbreviation || "")
                .toLowerCase()
                .includes(filterLower)
            );
          }

          // Remove duplicates, keep latest occurrence
          const uniqueLatest = filtered.reduceRight((acc, curr) => {
            const abbr = curr.abbreviation || curr.id;
            if (!acc.some((v) => (v.abbreviation || v.id) === abbr)) {
              acc.unshift(curr); // keep original order (latest wins)
            }
            return acc;
          }, []);

          return (
            <div key={language}>
              <IndividualVersionHeader language={language} />
              {uniqueLatest.map((version) => (
                <IndividualVersion
                  key={version.id}
                  id={version.id}
                  version={version}
                  chVer={props.ver}
                  setId={props.setVersionId}
                  setVis={props.setVisibility}
                />
              ))}
              <IndividualVersionHeader language={"Korean"} />
              <IndividualVersion
                key={"kor"}
                id={"kor"}
                version={KorVersion}
                chVer={props.ver}
                setId={props.setVersionId}
                setVis={props.setVisibility}
              />
            </div>
          );
        })}
    </div>
  );
};

export default VersionList;
