import React, { useState, useRef, useEffect } from 'react';
import './GamegleHomepage.css';

interface GameSuggestion {
  id: string;
  name: string;
  category: string;
}

interface GamegleHomepageProps {
  onNavigateToGames?: () => void;
}

const GamegleHomepage: React.FC<GamegleHomepageProps> = ({ onNavigateToGames }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredGames, setFilteredGames] = useState<GameSuggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sample game data - you can replace this with actual data 
  const gameSuggestions: GameSuggestion[] = [
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
      const filtered = gameSuggestions.filter(game =>
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

  const handleGameSelect = (game: GameSuggestion) => {
    setSearchQuery(game.name);
    setShowDropdown(false);
    // Navigate to games page
    if (onNavigateToGames) {
      onNavigateToGames();
    } else {
      window.location.href = '/App.html';
    }
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

  return (
    <div className="gamegle-homepage">
      <div className="google-logo">GAMEGLE</div>
      
      <div className="search-container" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="search-box"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            placeholder="Search Games"
            autoComplete="off"
          />
          
          <svg className="search-icon" viewBox="0 0 24 24" fill="#9aa0a6">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </form>

        {showDropdown && filteredGames.length > 0 && (
          <div className="search-dropdown active">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="dropdown-item"
                onClick={() => handleGameSelect(game)}
              >
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="#9aa0a6">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div className="dropdown-text">
                  <span className="highlight">{game.name}</span>
                  <span style={{ color: '#9aa0a6', fontSize: '12px', marginLeft: '8px' }}>
                    {game.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="links-container">
        <div>
          <a href="#" className="resource-link">Explore our website to find amazing games</a>
        </div>
      </div>
    </div>
  );
};

export default GamegleHomepage;
