import { useState, useRef, useEffect } from 'react';
import './games.css';

interface Game {
  id: number;
  title: string;
  genre: string;
  emoji: string;
  image: string;
}

export const GamesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = (path: string) => {
    window.location.href = path;
  };

  const games: Game[] = [
    { 
      id: 1, 
      title: "Cyber Warrior Collection", 
      genre: "Action Game", 
      emoji: "👾",
      image: "https://images.unsplash.com/photo-1486406149866-d404e343bbb1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    { 
      id: 2, 
      title: "Ocean Dreams NFT", 
      genre: "Adventure", 
      emoji: "🌊",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    { 
      id: 3, 
      title: "Purple Wolf Spirit", 
      genre: "RPG Game", 
      emoji: "🐺",
      image: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    { 
      id: 4, 
      title: "Shadow Portraits", 
      genre: "Horror", 
      emoji: "👻",
      image: "https://images.unsplash.com/photo-1511499008188-de491bbbae98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    { 
      id: 5, 
      title: "Cosmic Panda Club", 
      genre: "Puzzle", 
      emoji: "🐼",
      image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
    },
    { 
      id: 6, 
      title: "Space Explorers", 
      genre: "Adventure", 
      emoji: "🚀",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80"
    },
    { 
      id: 7, 
      title: "Racing Thunder", 
      genre: "Racing", 
      emoji: "🏎️",
      image: "https://images.unsplash.com/photo-1494905998402-395d579c36c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    { 
      id: 8, 
      title: "Puzzle Master", 
      genre: "Puzzle", 
      emoji: "🧩",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    }
  ];

  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowDropdown(e.target.value.length > 0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality here
    }
  };

  const selectGame = (title: string) => {
    setSearchQuery(title);
    setShowDropdown(false);
  };

  const navigateToHome = () => {
    navigate('/');
  };

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

  return (
    <div className="container">
      <header className="header">
        <div className="logo" onClick={navigateToHome}>
          GAMEGLE
        </div>
        <div className="search-bar" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowDropdown(true)}
              placeholder="Search Games"
              autoComplete="off"
            />
          </form>

          {showDropdown && filteredGames.length > 0 && (
            <div className="search-dropdown show">
              {filteredGames.map(game => (
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
        <div className="btncontainer">
          <button onClick={handleSearchSubmit} type="button" className="search-btn">
            Search
          </button>
          <button type="button" className="game-btn" onClick={navigateToHome}>
            Game
          </button>
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

export default GamesPage;
