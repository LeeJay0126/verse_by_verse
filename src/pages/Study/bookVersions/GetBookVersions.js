import api from "../../../component/Key";

const API_KEY = api;

const GetBookVersions = (bibleVersionID) => {
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