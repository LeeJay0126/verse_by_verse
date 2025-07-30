import getBibleVersions from "./GetBibleVersions";

const VersionList = () => {
    const versionList = document.querySelector(`#bible-version-list`);
    let versionHTML = ``;
    getBibleVersions.then((bibleVersionList) => {
        const sortedVersions = sortVersionsByLanguage(bibleVersionList);
        for (let languageGroup in sortedVersions) {
            const language = languageGroup;
            versionHTML += `<h4 class="list-heading"><span>${language}</span></h4><ul>`;
            const versions = sortedVersions[languageGroup];
            for (let version of versions) {
                versionHTML += `<li class="bible">
                        <a href="book.html?version=${version.id}&abbr=${version.abbreviation
                    }">
                          <abbr class="bible-version-abbr" title="${version.name
                    }">${version.abbreviation}</abbr>
                          <span>
                            <span class="bible-version-name">${version.name
                    }</span>
                            ${version.description
                        ? '<span class="bible-version-desc">' +
                        version.description +
                        "</span>"
                        : ""
                    }
                          </span>
                        </a>
                      </li>`;
            }
            versionHTML += `</ul>`;
        }
        versionList.innerHTML = versionHTML;
    });
}

export default VersionList;