const BOOK_NAMES = {
  ge: "Genesis",
  exo: "Exodus",
  lev: "Leviticus",
  num: "Numbers",
  deu: "Deuteronomy",
  josh: "Joshua",
  jdgs: "Judges",
  ruth: "Ruth",
  "1sm": "1 Samuel",
  "2sm": "2 Samuel",
  "1ki": "1 Kings",
  "2ki": "2 Kings",
  "1chr": "1 Chronicles",
  "2chr": "2 Chronicles",
  ezra: "Ezra",
  neh: "Nehemiah",
  est: "Esther",
  job: "Job",
  psa: "Psalms",
  prv: "Proverbs",
  eccl: "Ecclesiastes",
  ssol: "Song of Songs",
  isa: "Isaiah",
  jer: "Jeremiah",
  lam: "Lamentations",
  eze: "Ezekiel",
  dan: "Daniel",
  hos: "Hosea",
  joel: "Joel",
  amos: "Amos",
  obad: "Obadiah",
  jonah: "Jonah",
  mic: "Micah",
  nahum: "Nahum",
  hab: "Habakkuk",
  zep: "Zephaniah",
  hag: "Haggai",
  zec: "Zechariah",
  mal: "Malachi",
  mat: "Matthew",
  mark: "Mark",
  luke: "Luke",
  john: "John",
  acts: "Acts",
  rom: "Romans",
  "1cor": "1 Corinthians",
  "2cor": "2 Corinthians",
  gal: "Galatians",
  eph: "Ephesians",
  phi: "Philippians",
  col: "Colossians",
  "1th": "1 Thessalonians",
  "2th": "2 Thessalonians",
  "1tim": "1 Timothy",
  "2tim": "2 Timothy",
  titus: "Titus",
  phmn: "Philemon",
  heb: "Hebrews",
  jas: "James",
  "1pet": "1 Peter",
  "2pet": "2 Peter",
  "1jn": "1 John",
  "2jn": "2 John",
  "3jn": "3 John",
  jude: "Jude",
  rev: "Revelation",
  jhn: "John",
};

export const getNoteBookName = (chapterId = "") => {
  const [bookId] = String(chapterId).split(".");
  const key = String(bookId || "").toLowerCase();
  return BOOK_NAMES[key] || String(bookId || "").toUpperCase();
};

export const formatNoteRangeLabel = (note) => {
  if (!note) return "";
  if (note?.rangeStart == null || note?.rangeEnd == null) return "Full chapter";
  if (note.rangeStart === note.rangeEnd) return `Verse ${note.rangeStart}`;
  return `Verses ${note.rangeStart}-${note.rangeEnd}`;
};

export const formatReadableNoteReference = (note) => {
  const chapterId = String(note?.chapterId || "");
  const [, chapterNum] = chapterId.split(".");
  const base = [getNoteBookName(chapterId), chapterNum].filter(Boolean).join(" ");
  const rangeLabel = formatNoteRangeLabel(note);
  return [base, rangeLabel].filter(Boolean).join(" • ");
};

export const formatNoteReference = (note) => {
  const chapterId = String(note?.chapterId || "");
  const [, chapterNum] = chapterId.split(".");
  const base = [getNoteBookName(chapterId), chapterNum].filter(Boolean).join(" ");
  const rangeLabel = formatNoteRangeLabel(note);
  return [base, rangeLabel].filter(Boolean).join(" • ");
};
