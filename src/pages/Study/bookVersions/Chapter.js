import { useEffect, useState } from "react";
import API from "../../../component/Key";

const Chapter = ({ version: bibleVersionID, book: bibleBookID, setChapters }) => {
  const [localChapters, setLocalChapters] = useState([]);
  const [error, setError] = useState(null);
  const API_KEY = API;
  
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        if (bibleVersionID === "kor") {
          // Special Korean Bible handling
          console.log("Fetching Korean Bible chapters...");
          // Example:
          // const koreanData = [...];
          // setLocalChapters(koreanData);
          // setChapters(koreanData);
          return;
        }

        const res = await fetch(
          `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books/${bibleBookID}/chapters`,
          { headers: { "api-key": API_KEY } }
        );

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const { data } = await res.json();
        const chaptersData = data.map(({ number, id }) => ({ number, id }));
        setLocalChapters(chaptersData);
        setChapters(chaptersData); // Update parent state too
      } catch (err) {
        console.error("Error fetching chapters:", err);
        setError(err.message);
      }
    };

    if (bibleVersionID && bibleBookID) {
      fetchChapters();
    }
  }, [bibleVersionID, bibleBookID, setChapters]);

  if (error) return <li>Error: {error}</li>;
  if (!localChapters.length) return <li>Loading...</li>;

  return (
    <>
      {localChapters.map(({ id, number }) => (
        <li key={id}>Chapter {number}</li>
      ))}
    </>
  );
};

export default Chapter;