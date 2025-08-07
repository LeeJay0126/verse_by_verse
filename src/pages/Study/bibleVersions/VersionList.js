import { useState, useEffect } from "react";
import getBibleVersions from "./GetBibleVersions";
import IndividualVersion from "./IndividualVersion";
import IndividualVersionHeader from "./IndividualVersionHeader";
import sortVersionsByLanguage from "./SortVersionsByLanguage";

const VersionList = () => {
  const [versionsByLanguage, setVersionsByLanguage] = useState({});

  // Abbreviations to show
  const allowedAbbreviations = ["ASV", "BSB", "engKJV", "WEB", "FBV"];

  useEffect(() => {
    getBibleVersions.then((bibleVersionList) => {
      const sorted = sortVersionsByLanguage(bibleVersionList);
      setVersionsByLanguage(sorted);
    });
  }, []);

  return (
    <div>
      {Object.entries(versionsByLanguage)
        .filter(([language]) => language === "English")
        .map(([language, versions]) => {
          // Keep only allowed abbreviations
          const filtered = versions.filter((version) =>
            allowedAbbreviations.includes(version.abbreviation || version.id)
          );

          // Remove duplicates, keeping latest occurrence
          const uniqueLatest = filtered.reduceRight((acc, curr) => {
            const abbr = curr.abbreviation || curr.id;
            if (!acc.some((v) => (v.abbreviation || v.id) === abbr)) {
              acc.unshift(curr); // keep order as original (latest wins)
            }
            return acc;
          }, []);

          return (
            <div key={language}>
              <IndividualVersionHeader language={language} />
              {uniqueLatest.map((version) => (
                <IndividualVersion key={version.id} version={version} />
              ))}
            </div>
          );
        })}
    </div>
  );
};

export default VersionList;



