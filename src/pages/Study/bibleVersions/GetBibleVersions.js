import api from "../../../component/Key";

const API_KEY = api;
const API_URL = 'https://api.scripture.api.bible/v1/bibles';

const getBibleVersions = fetch(API_URL, {
  method: 'GET',
  headers: {
    'api-key': API_KEY,
    'accept': 'application/json',
  }
})
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => data.data) // `data` field inside JSON contains the array of bibles
  .catch(err => {
    console.error("Failed to fetch Bible versions:", err);
    return [];
  });

export default getBibleVersions;