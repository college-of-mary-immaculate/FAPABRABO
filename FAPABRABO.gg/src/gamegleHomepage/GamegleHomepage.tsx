import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ use navigate
import './GamegleHomepage.css';
import TopRightIcons from '../components/dots';

interface GameSuggestion {
  id: string;
  name: string;
  category?: string;
}

const GamegleHomepage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredGames, setFilteredGames] = useState<GameSuggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();  // ✅ use React Router

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim()) {
        try {
          const response = await fetch(`http://127.0.0.1:8000/suggest?q=${searchQuery}`);
          if (response.ok) {
            const data = await response.json();
            const mapped = data.suggestions.map((token: string, index: number) => ({
              id: String(index),
              name: `${searchQuery.trim()} ${token}`,
            }));
            setFilteredGames(mapped);
            setShowDropdown(mapped.length > 0);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
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
    setShowDropdown(true);
  };

  // ✅ Instead of reloading, navigate and pass query
  const handleGameSelect = (game: GameSuggestion) => {
    setSearchQuery(game.name);
    setShowDropdown(false);
    navigate(`/games`, { state: { query: game.name } });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/games`, { state: { query: searchQuery } });
      setShowDropdown(false);
    }
  };

  return (
    <div className="gamegle-homepage">

      <TopRightIcons />
      <div className="google-logo">GAMEGLE</div>



      <div className="search-container" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="search-box"
            value={searchQuery}
            onChange={handleSearchChange}
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
                <span className="highlight">{game.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamegleHomepage;
