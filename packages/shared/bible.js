const SCRIPTURE_API_BASE = "https://api.scripture.api.bible/v1";

const SCRIPTURE_API_ENV_KEYS = [
  "REACT_APP_SCRIPTURE_API_KEY",
  "EXPO_PUBLIC_SCRIPTURE_API_KEY",
  "SCRIPTURE_API_KEY",
];

const KOR_BOOKS = [
  { id: "ge", name: "Genesis" },
  { id: "exo", name: "Exodus" },
  { id: "lev", name: "Leviticus" },
  { id: "num", name: "Numbers" },
  { id: "deu", name: "Deuteronomy" },
  { id: "josh", name: "Joshua" },
  { id: "jdgs", name: "Judges" },
  { id: "ruth", name: "Ruth" },
  { id: "1sm", name: "1 Samuel" },
  { id: "2sm", name: "2 Samuel" },
  { id: "1ki", name: "1 Kings" },
  { id: "2ki", name: "2 Kings" },
  { id: "1chr", name: "1 Chronicles" },
  { id: "2chr", name: "2 Chronicles" },
  { id: "ezra", name: "Ezra" },
  { id: "neh", name: "Nehemiah" },
  { id: "est", name: "Esther" },
  { id: "job", name: "Job" },
  { id: "psa", name: "Psalms" },
  { id: "prv", name: "Proverbs" },
  { id: "eccl", name: "Ecclesiastes" },
  { id: "ssol", name: "Song of Songs" },
  { id: "isa", name: "Isaiah" },
  { id: "jer", name: "Jeremiah" },
  { id: "lam", name: "Lamentations" },
  { id: "eze", name: "Ezekiel" },
  { id: "dan", name: "Daniel" },
  { id: "hos", name: "Hosea" },
  { id: "joel", name: "Joel" },
  { id: "amos", name: "Amos" },
  { id: "obad", name: "Obadiah" },
  { id: "jonah", name: "Jonah" },
  { id: "mic", name: "Micah" },
  { id: "nahum", name: "Nahum" },
  { id: "hab", name: "Habakkuk" },
  { id: "zep", name: "Zephaniah" },
  { id: "hag", name: "Haggai" },
  { id: "zec", name: "Zechariah" },
  { id: "mal", name: "Malachi" },
  { id: "mat", name: "Matthew" },
  { id: "mark", name: "Mark" },
  { id: "luke", name: "Luke" },
  { id: "john", name: "John" },
  { id: "acts", name: "Acts" },
  { id: "rom", name: "Romans" },
  { id: "1cor", name: "1 Corinthians" },
  { id: "2cor", name: "2 Corinthians" },
  { id: "gal", name: "Galatians" },
  { id: "eph", name: "Ephesians" },
  { id: "phi", name: "Philippians" },
  { id: "col", name: "Colossians" },
  { id: "1th", name: "1 Thessalonians" },
  { id: "2th", name: "2 Thessalonians" },
  { id: "1tim", name: "1 Timothy" },
  { id: "2tim", name: "2 Timothy" },
  { id: "titus", name: "Titus" },
  { id: "phmn", name: "Philemon" },
  { id: "heb", name: "Hebrews" },
  { id: "jas", name: "James" },
  { id: "1pet", name: "1 Peter" },
  { id: "2pet", name: "2 Peter" },
  { id: "1jn", name: "1 John" },
  { id: "2jn", name: "2 John" },
  { id: "3jn", name: "3 John" },
  { id: "jude", name: "Jude" },
  { id: "rev", name: "Revelation" },
];

const KOR_CHAPTER_COUNTS = {
  ge: 50, exo: 40, lev: 27, num: 36, deu: 34,
  josh: 24, jdgs: 21, ruth: 4, "1sm": 31, "2sm": 24,
  "1ki": 22, "2ki": 25, "1chr": 29, "2chr": 36,
  ezra: 10, neh: 13, est: 10, job: 42, psa: 150,
  prv: 31, eccl: 12, ssol: 8, isa: 66, jer: 52,
  lam: 5, eze: 48, dan: 12, hos: 14, joel: 3,
  amos: 9, obad: 1, jonah: 4, mic: 7, nahum: 3,
  hab: 3, zep: 3, hag: 2, zec: 14, mal: 4,
  mat: 28, mark: 16, luke: 24, john: 21, acts: 28,
  rom: 16, "1cor": 16, "2cor": 13, gal: 6, eph: 6,
  phi: 4, col: 4, "1th": 5, "2th": 3, "1tim": 6,
  "2tim": 4, titus: 3, phmn: 1, heb: 13, jas: 5,
  "1pet": 5, "2pet": 3, "1jn": 5, "2jn": 1, "3jn": 1,
  jude: 1, rev: 22,
};

const DEFAULT_BIBLE_VERSION_ID = "06125adad2d5898a-01";
const DEFAULT_BIBLE_VERSIONS = [
  {
    id: DEFAULT_BIBLE_VERSION_ID,
    abbreviation: "ASV",
    name: "American Standard Version",
    language: "English",
  },
  {
    id: "kor",
    abbreviation: "KOR",
    name: "Korean Revised Version",
    language: "Korean",
  },
];
const FALLBACK_BIBLE_VERSION_ID = "kor";
const FALLBACK_BIBLE_VERSIONS = [DEFAULT_BIBLE_VERSIONS[1]];

const getScriptureApiKey = (env = {}) =>
  SCRIPTURE_API_ENV_KEYS.map((key) => env[key]).find(Boolean) || "";

const ensureOk = async (response, fallbackMessage) => {
  if (!response.ok) {
    throw new Error(fallbackMessage || `HTTP ${response.status}`);
  }

  return response;
};

const createScriptureFetch = ({ fetchImpl, env }) => async (path) => {
  const apiKey = getScriptureApiKey(env);

  if (!apiKey) {
    throw new Error("Missing Scripture API key.");
  }

  const response = await fetchImpl(`${SCRIPTURE_API_BASE}${path}`, {
    headers: {
      "api-key": apiKey,
      accept: "application/json",
    },
  });

  await ensureOk(response, `Scripture API request failed (${response.status})`);
  return response.json();
};

const normalizeVerseNumber = (verse, index) => {
  const direct = Number(verse?.number);
  if (!Number.isNaN(direct) && direct > 0) return direct;

  const reference = (verse?.reference || "").toString();
  const tail = reference.split(":").pop();
  const parsed = Number.parseInt(tail, 10);

  return Number.isNaN(parsed) ? index + 1 : parsed;
};

const createBibleApi = (config = {}) => {
  const {
    env = {},
    fetchImpl = fetch,
    apiFetch,
  } = config;

  const scriptureFetch = createScriptureFetch({ fetchImpl, env });
  const hasScriptureApiKey = Boolean(getScriptureApiKey(env));
  const defaultVersionId = hasScriptureApiKey
    ? DEFAULT_BIBLE_VERSION_ID
    : FALLBACK_BIBLE_VERSION_ID;

  const listVersions = async () => {
    if (!hasScriptureApiKey) {
      return FALLBACK_BIBLE_VERSIONS;
    }

    const payload = await scriptureFetch("/bibles");
    const versions = Array.isArray(payload?.data) ? payload.data : [];
    const allowedAbbreviations = new Set(["ASV", "BSB", "engKJV", "WEB", "FBV"]);

    const curated = versions
      .filter((version) => allowedAbbreviations.has(version?.abbreviation || version?.id))
      .reduceRight((acc, version) => {
        const key = version?.abbreviation || version?.id;

        if (!key || acc.some((entry) => (entry.abbreviation || entry.id) === key)) {
          return acc;
        }

        acc.unshift({
          id: version.id,
          abbreviation: version.abbreviation || version.id,
          name: version.name || version.abbreviation || version.id,
          language: version?.language?.name || "",
        });

        return acc;
      }, []);

    return [
      ...curated,
      DEFAULT_BIBLE_VERSIONS[1],
    ];
  };

  const listBooks = async (versionId = defaultVersionId) => {
    if (versionId === "kor") {
      return KOR_BOOKS;
    }

    const payload = await scriptureFetch(`/bibles/${versionId}/books`);
    return (payload?.data || []).map(({ id, name }) => ({ id, name }));
  };

  const listChapters = async (versionId = defaultVersionId, bookId) => {
    if (!bookId) return [];

    if (versionId === "kor") {
      const count = KOR_CHAPTER_COUNTS[bookId] || 0;
      return Array.from({ length: count }, (_, index) => ({
        id: `${bookId}.${index + 1}`,
        number: index + 1,
      }));
    }

    const payload = await scriptureFetch(`/bibles/${versionId}/books/${bookId}/chapters`);
    return (payload?.data || []).map(({ id, number }) => ({
      id,
      number: Number(number),
    }));
  };

  const getChapterVerses = async ({ versionId = defaultVersionId, chapterId }) => {
    if (!chapterId) return [];

    if (versionId === "kor") {
      if (typeof apiFetch !== "function") {
        throw new Error("Missing app API client for KOR passage requests.");
      }

      const response = await apiFetch(`/api/passage/${versionId}/${chapterId}`, {
        method: "GET",
      });

      await ensureOk(response, `Passage proxy request failed (${response.status})`);
      const payload = await response.json();

      return (payload?.verses || []).map((verse, index) => ({
        id: verse?.id || `${chapterId}.${index + 1}`,
        number: Number(verse?.number) || index + 1,
        text: (verse?.text || "").toString().trim(),
      }));
    }

    const listPayload = await scriptureFetch(
      `/bibles/${versionId}/chapters/${chapterId}/verses?content-type=json&include-verse-numbers=true&include-verse-spans=true`
    );

    const rawVerses = Array.isArray(listPayload?.data) ? listPayload.data : [];
    const verses = rawVerses.map((verse, index) => ({
      id: verse.id,
      number: normalizeVerseNumber(verse, index),
    }));

    const detailedVerses = await Promise.all(
      verses.map(async (verse) => {
        const payload = await scriptureFetch(
          `/bibles/${versionId}/verses/${verse.id}?content-type=text&include-verse-numbers=false&include-notes=false&include-titles=false`
        );

        return {
          ...verse,
          text: (payload?.data?.text ?? payload?.data?.content ?? "").toString().trim(),
        };
      })
    );

    return detailedVerses;
  };

  return {
    listVersions,
    listBooks,
    listChapters,
    getChapterVerses,
  };
};

module.exports = {
  SCRIPTURE_API_ENV_KEYS,
  DEFAULT_BIBLE_VERSION_ID,
  DEFAULT_BIBLE_VERSIONS,
  FALLBACK_BIBLE_VERSION_ID,
  FALLBACK_BIBLE_VERSIONS,
  KOR_BOOKS,
  KOR_CHAPTER_COUNTS,
  getScriptureApiKey,
  createBibleApi,
};
