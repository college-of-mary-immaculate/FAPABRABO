import React, { useState, useRef, useEffect } from 'react';
import './GamegleHomepage.css';
import Footer from './footerSection.tsx'


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
      <div className="search-logo">GAMEGLE</div>
      <div className="search-container" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          <input
            type="text"
            className="search-box"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            placeholder="Search Games"
            autoComplete="off"
          />
          
        </form>

        {showDropdown && filteredGames.length > 0 && (
          <div className="search-dropdown active">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="dropdown-item"
                onClick={() => handleGameSelect(game)}
              >
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
     <Footer/>
    </div>
  );
};

export default GamegleHomepage;
