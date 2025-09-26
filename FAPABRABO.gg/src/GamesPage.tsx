import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Game {
  id: string;
  name: string;
  category: string;
}

interface GamesPageProps {
  onNavigateToHome?: () => void;
}

const GamesPage: React.FC<GamesPageProps> = ({ onNavigateToHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sample game data
  const games: Game[] = [
    { id: '1', name: 'Cyberpunk 2077', category: 'RPG' },
    { id: '2', name: 'The Witcher 3', category: 'RPG' },
    { id: '3', name: 'Call of Duty', category: 'FPS' },
    { id: '4', name: 'FIFA 24', category: 'Sports' },
    { id: '5', name: 'Minecraft', category: 'Sandbox' },
    { id: '6', name: 'Grand Theft Auto V', category: 'Action' },
    { id: '7', name: 'Fortnite', category: 'Battle Royale' },
    { id: '8', name: 'Among Us', category: 'Party' },
    { id: '9', name: 'Valorant', category: 'FPS' },
    { id: '10', name: 'League of Legends', category: 'MOBA' },
  ];

  // Filter games based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = games.filter(game =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGames(filtered);
      setShowDropdown(true);
    } else {
      setFilteredGames([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleGameSelect = (game: Game) => {
    setSearchQuery(game.name);
    setShowDropdown(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredGames.length > 0) {
      handleGameSelect(filteredGames[0]);
    }
  };

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setShowDropdown(true);
    }
  };

  const navigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    } else {
      window.location.href = '/';
    }
  };


  return (
    <div className="container">
      <header className="header">
        <div className="logo" onClick={navigateToHome} style={{ cursor: 'pointer' }}>
          GAMEGLE
        </div>
        <div className="search-bar" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              placeholder="Search Games"
              autoComplete="off"
            />
          </form>
          
          {showDropdown && filteredGames.length > 0 && (
            <div className="search-dropdown show">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="search-suggestion"
                  onClick={() => handleGameSelect(game)}
                >
                  <span className="suggestion-text">{game.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Popular Games</h1>
        </div>

        <div className="games-grid">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-image">
                <div className="game-rating">
                  <div className="rating-icon rating-positive"></div>
                  <div className="rating-icon rating-mixed"></div>
                  <div className="rating-icon rating-negative"></div>
                </div>
              </div>
              <div className="game-info">
                <h3 className="game-title">{game.name}</h3>
                <div className="game-meta">{game.category}</div>
                <div className="game-stats">
                  <span className="stat-item">Game</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GamesPage;
