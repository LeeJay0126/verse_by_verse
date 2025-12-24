import "./NotePage.css";
import { useNavigate } from "react-router-dom";
import NoteDetail from "./NoteDetails";

const NotePage = ({ onOpenPassage }) => {
  const navigate = useNavigate();

  return (
    <div className="NotePage">
      <div className="NotePageTop">
        <button className="NotePageBack" type="button" onClick={() => navigate("/notes")}>
          ← Back
        </button>
      </div>

      <NoteDetail onOpenPassage={onOpenPassage} />
    </div>
  );
};

export default NotePage;
