import api from "../../../component/Key";

const API_KEY = api;
const API_URL = 'https://api.scripture.api.bible/v1/bibles';

const KOR_BOOKS = [
  { id: 'ge',   name: '창세기 (Genesis)' },
  { id: 'exo',  name: '출애굽기 (Exodus)' },
  { id: 'lev',  name: '레위기 (Leviticus)' },
  { id: 'num',  name: '민수기 (Numbers)' },
  { id: 'deu',  name: '신명기 (Deuteronomy)' },
  { id: 'josh', name: '여호수아 (Joshua)' },
  { id: 'jdgs', name: '사사기 (Judges)' },
  { id: 'ruth', name: '룻기 (Ruth)' },
  { id: '1sm',  name: '사무엘상 (1 Samuel)' },
  { id: '2sm',  name: '사무엘하 (2 Samuel)' },
  { id: '1ki',  name: '열왕기상 (1 Kings)' },
  { id: '2ki',  name: '열왕기하 (2 Kings)' },
  { id: '1chr', name: '역대상 (1 Chronicles)' },
  { id: '2chr', name: '역대하 (2 Chronicles)' },
  { id: 'ezra', name: '에스라 (Ezra)' },
  { id: 'neh',  name: '느헤미야 (Nehemiah)' },
  { id: 'est',  name: '에스더 (Esther)' },
  { id: 'job',  name: '욥기 (Job)' },
  { id: 'psa',  name: '시편 (Psalms)' },
  { id: 'prv',  name: '잠언 (Proverbs)' },
  { id: 'eccl', name: '전도서 (Ecclesiastes)' },
  { id: 'ssol', name: '아가 (Song of Songs)' },
  { id: 'isa',  name: '이사야 (Isaiah)' },
  { id: 'jer',  name: '예레미야 (Jeremiah)' },
  { id: 'lam',  name: '예레미야애가 (Lamentations)' },
  { id: 'eze',  name: '에스겔 (Ezekiel)' },
  { id: 'dan',  name: '다니엘 (Daniel)' },
  { id: 'hos',  name: '호세아 (Hosea)' },
  { id: 'joel', name: '요엘 (Joel)' },
  { id: 'amos', name: '아모스 (Amos)' },
  { id: 'obad', name: '오바댜 (Obadiah)' },
  { id: 'jonah',name: '요나 (Jonah)' },
  { id: 'mic',  name: '미가 (Micah)' },
  { id: 'nahum',name: '나훔 (Nahum)' },
  { id: 'hab',  name: '하박국 (Habakkuk)' },
  { id: 'zep',  name: '스바냐 (Zephaniah)' },
  { id: 'hag',  name: '학개 (Haggai)' },
  { id: 'zec',  name: '스가랴 (Zechariah)' },
  { id: 'mal',  name: '말라기 (Malachi)' },
  { id: 'mat',  name: '마태복음 (Matthew)' },
  { id: 'mark', name: '마가복음 (Mark)' },
  { id: 'luke', name: '누가복음 (Luke)' },
  { id: 'john', name: '요한복음 (John)' },
  { id: 'acts', name: '사도행전 (Acts)' },
  { id: 'rom',  name: '로마서 (Romans)' },
  { id: '1cor', name: '고린도전서 (1 Corinthians)' },
  { id: '2cor', name: '고린도후서 (2 Corinthians)' },
  { id: 'gal',  name: '갈라디아서 (Galatians)' },
  { id: 'eph',  name: '에베소서 (Ephesians)' },
  { id: 'phi',  name: '빌립보서 (Philippians)' },
  { id: 'col',  name: '골로새서 (Colossians)' },
  { id: '1th',  name: '데살로니가전서 (1 Thessalonians)' },
  { id: '2th',  name: '데살로니가후서 (2 Thessalonians)' },
  { id: '1tim', name: '디모데전서 (1 Timothy)' },
  { id: '2tim', name: '디모데후서 (2 Timothy)' },
  { id: 'titus',name: '디도서 (Titus)' },
  { id: 'phmn', name: '빌레몬서 (Philemon)' },
  { id: 'heb',  name: '히브리서 (Hebrews)' },
  { id: 'jas',  name: '야고보서 (James)' },
  { id: '1pet', name: '베드로전서 (1 Peter)' },
  { id: '2pet', name: '베드로후서 (2 Peter)' },
  { id: '1jn',  name: '요한일서 (1 John)' },
  { id: '2jn',  name: '요한이서 (2 John)' },
  { id: '3jn',  name: '요한삼서 (3 John)' },
  { id: 'jude', name: '유다서 (Jude)' },
  { id: 'rev',  name: '요한계시록 (Revelation)' },
];

const GetBookVersions = (bibleVersionID) => {
  if (bibleVersionID === 'kor') {
    return Promise.resolve(KOR_BOOKS);
  }

  const url = `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books`;

  return fetch(url, {
    method: 'GET',
    headers: {
      'api-key': API_KEY,
      'accept': 'application/json'
    }
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      return data.data.map(({ name, id }) => ({ name, id }));
    })
    .catch(err => {
      console.error('Failed to fetch books:', err);
      return [];
    });
};

export default GetBookVersions;
