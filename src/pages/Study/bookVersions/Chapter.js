import { useEffect, useState } from "react";
import API from "../../../component/Key";

const Chapter = ({ version: bibleVersionID, book: bibleBookID, setChapters }) => {
  const [localChapters, setLocalChapters] = useState([]);
  const [error, setError] = useState(null);
  const API_KEY = API;

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        if (!bibleVersionID || !bibleBookID) return;

        const res = await fetch(
          `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books/${bibleBookID}/chapters`,
          { headers: { "api-key": API_KEY } }
        );

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const { data } = await res.json();
        const chaptersData = data.map(({ number, id }) => ({ number, id }));

        setLocalChapters(chaptersData);
        setChapters(chaptersData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchChapters();
  }, [bibleVersionID, bibleBookID, setChapters]);

  if (error) return <li>Error: {error}</li>;
  if (!localChapters.length) return <li>Loading chapters...</li>;

  return (
    <>
      {localChapters.map(({ id, number }) => (
        <li key={id}>Chapter {number}</li>
      ))}
    </>
  );
};

export default Chapter;
