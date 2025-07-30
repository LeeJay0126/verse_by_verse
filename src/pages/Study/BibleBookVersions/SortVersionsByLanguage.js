
const sortVersionsByLanguage = (bibleVersionList) => {
    let sortedVersions = {};

    for (const version of bibleVersionList) {
        if (!sortedVersions[version.language]) {
            sortedVersions[version.language] = [];
        }
        sortedVersions[version.language].push(version);
    }
    for (const version in sortedVersions) {
        sortedVersions[version].sort((a, b) => {
            const nameA = a.abbreviation.toUpperCase();
            const nameB = b.abbreviation.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
    }
    return sortedVersions;
};

export default SortVersionsByLanguage;