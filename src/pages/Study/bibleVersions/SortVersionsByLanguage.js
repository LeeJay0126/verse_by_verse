
const sortVersionsByLanguage = (versionList) => {
  const sortedVersions = {};

  versionList.forEach((version) => {
    const language = version.language?.name || 'Unknown';

    if (!sortedVersions[language]) {
      sortedVersions[language] = [];
    }

    sortedVersions[language].push(version);
  });

  // Sort versions alphabetically within each language group by abbreviation
  for (const language in sortedVersions) {
    sortedVersions[language].sort((a, b) => {
      return a.abbreviation.localeCompare(b.abbreviation);
    });
  }

  return sortedVersions;
};

export default sortVersionsByLanguage;