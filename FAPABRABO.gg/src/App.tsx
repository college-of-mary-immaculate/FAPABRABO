
import { useState } from "react"
import GamegleHomepage from "./GamegleHomepage"
import GamesPage from "./GamesPage"

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'games'>('home');

  const navigateToGames = () => {
    setCurrentPage('games');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  if (currentPage === 'home') {
    return <GamegleHomepage onNavigateToGames={navigateToGames} />;
  }

  return <GamesPage onNavigateToHome={navigateToHome} />;
}
