// SortVersionsByLanguage.js
const sortVersionsByLanguage = (versionList) => {
  const sortedVersions = {};

  versionList.forEach((version) => {
    const language = version.language?.name || "Unknown";
    if (!sortedVersions[language]) {
      sortedVersions[language] = [];
    }
    sortedVersions[language].push(version);
  });

  for (const language in sortedVersions) {
    sortedVersions[language].sort((a, b) => {
      const aAbbr = a.abbreviation || a.id || "";
      const bAbbr = b.abbreviation || b.id || "";
      return aAbbr.localeCompare(bAbbr);
    });
  }

  return sortedVersions;
};

export default sortVersionsByLanguage;
