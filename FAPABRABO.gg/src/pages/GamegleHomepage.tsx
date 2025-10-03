import React, { useState, useRef, useEffect } from 'react';
import '../styles/GamegleHomepage.css';

interface GameSuggestion {
  id: string;
  name: string;
  category?: string; // optional
}

interface GamegleHomepageProps {
  onNavigateToGames?: () => void;
}

const GamegleHomepage: React.FC<GamegleHomepageProps> = ({ onNavigateToGames }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredGames, setFilteredGames] = useState<GameSuggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions whenever searchQuery changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim()) {
        try {
          const response = await fetch(`http://127.0.0.1:8000/suggest?q=${searchQuery}`);
          if (response.ok) {
            const data = await response.json();
            // Map backend response to our suggestion objects
            const mapped = data.suggestions.map((token: string, index: number) => ({
              id: String(index),
              name: `${searchQuery.trim()} ${token}`
            }));
            setFilteredGames(mapped);
            setShowDropdown(mapped.length > 0); // always show dropdown if there are suggestions
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setFilteredGames([]);
          setShowDropdown(false);
        }
      } else {
        setFilteredGames([]);
        setShowDropdown(false);
      }
    };

    fetchSuggestions();
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true); // show dropdown whenever typing
  };

  const handleGameSelect = (game: GameSuggestion) => {
    setSearchQuery(game.name);
    setShowDropdown(false);
    if (onNavigateToGames) onNavigateToGames();
    else window.location.href = '/';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredGames.length > 0) handleGameSelect(filteredGames[0]);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && filteredGames.length > 0) {
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
                  {game.category && (
                    <span style={{ color: '#9aa0a6', fontSize: '12px', marginLeft: '8px' }}>
                      {game.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamegleHomepage;
