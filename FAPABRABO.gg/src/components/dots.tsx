import React from "react";
import "./topicon.css";
import { HelpCircle, Grid } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ import React Router navigation hook

const TopRightIcons: React.FC = () => {
  const navigate = useNavigate(); // ✅ create navigate function

  // 🕹️ When Grid icon is clicked
  const handleOpenGamesPage = () => {
    navigate("/TOPK"); // ✅ go to /games route
  };

  return (
    <div className="top-right-icons">
      <button className="icon-btn" title="Help">
        <HelpCircle />
      </button>

      {/* kapag pinindot ito mag oopen yung page na gamespage.tsx */}
      <button
        className="icon-btn"
        title="Top Publisher"
        onClick={handleOpenGamesPage} // ✅ triggers navigation
      >
        <Grid />
      </button>
    </div>
  );
};

export default TopRightIcons;
