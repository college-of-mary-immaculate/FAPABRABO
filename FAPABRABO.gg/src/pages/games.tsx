import { useState, useRef, useEffect } from "react";
import "../styles/popular.css";

interface Game {
  id: number;
  title: string;
  genre: string;
  emoji: string;
}

const PopularPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const games: Game[] = [
    { id: 1, title: "Cyber Warrior Collection", genre: "Action Game", emoji: "👾" },
    { id: 2, title: "Ocean Dreams NFT", genre: "Adventure", emoji: "🌊" },
    { id: 3, title: "Purple Wolf Spirit", genre: "RPG Game", emoji: "🐺" },
    { id: 4, title: "Shadow Portraits", genre: "Horror", emoji: "👻" },
    { id: 5, title: "Cosmic Panda Club", genre: "Puzzle", emoji: "🐼" },
    { id: 6, title: "Space Explorers", genre: "Adventure", emoji: "🚀" },
    { id: 7, title: "Racing Thunder", genre: "Racing", emoji: "🏎️" },
    { id: 8, title: "Puzzle Master", genre: "Puzzle", emoji: "🧩" },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = games.filter((game) =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGames(filtered);
    } else {
      setFilteredGames([]);
    }
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(e.target.value.length > 0);
  };

  const selectGame = (title: string) => {
    setSearchQuery(title);
    setShowDropdown(false);
  };

  const navigateToHome = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="container">
      <header className="header">
        <div className="logo" onClick={navigateToHome}>
          GAMEGLE
        </div>
        <div className="search-bar" ref={searchRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search Games"
            autoComplete="off"
          />

          {showDropdown && filteredGames.length > 0 && (
            <div className="search-dropdown show">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="search-suggestion"
                  onClick={() => selectGame(game.title)}
                >
                  <span className="suggestion-text">{game.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="popularGames">
        <h2>Popular Games</h2>
      </div>

      <div className="collection-grid">
        {games.slice(0, 3).map((game) => (
          <div key={game.id} className={`nft-card card-${game.id}`}>
            <div className="nft-image">{game.emoji}</div>
            <div className="nft-info">
              <h3 className="nft-title">{game.title}</h3>
              <div className="nft-details">
                <span className="nft-status">{game.genre}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularPage;
