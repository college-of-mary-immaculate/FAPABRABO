"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import "./App.css"

interface SearchResult {
  id: string
  siteName: string
  siteUrl: string
  title: string
  description: string
  thumbnail: string

}

interface GamesPageProps {
  onNavigateToHome?: () => void
}

const GamesPage: React.FC<GamesPageProps> = ({ onNavigateToHome }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

 const searchResults: SearchResult[] = [
  {
    id: "1",
    siteName: "CrazyGames",
    siteUrl: "crazygames.com › horror › scary",
    title: "Scary Games 😱 Play on CrazyGames",
    description:
      "There are various scary games you can play to get your hit of adrenaline. Some games have attracted controversy and others take inspiration from the stone-cold classics. One of those classics is...",
    thumbnail: "/scary-horror-game-character.jpg"
  },
  {
    id: "2",
    siteName: "PC Gamer",
    siteUrl: "pcgamer.com › games › horror",
    title: "Don't Lie is a freaky new horror game about a reclus...",
    description: "1 day ago - The walls have eyes. Everything has eyes. The eyes might have eyes.",
    thumbnail: "/creepy-horror-game-scene.jpg"
  },
  {
    id: "3",
    siteName: "Activision",
    siteUrl: "callofduty.com › games › modern-warfare",
    title: "Call of Duty: Modern Warfare III - Official Site",
    description: "Experience the most intense multiplayer combat yet. Join millions of players in epic battles across iconic maps. Pre-order now for exclusive content and early access to the beta.",
    thumbnail: "/call-of-duty-thumbnail.jpg"
  },
  {
    id: "4",
    siteName: "EA Sports",
    siteUrl: "ea.com › games › fifa › fifa-24",
    title: "EA SPORTS FC 24 - The World's Game",
    description: "2 days ago - Experience the beautiful game like never before with HyperMotionV technology. Play with over 19,000 players across 700+ teams in the most authentic football experience.",
    thumbnail: "/fifa-24-thumbnail.jpg"
  },
  {
    id: "5",
    siteName: "Minecraft",
    siteUrl: "minecraft.net › explore › games",
    title: "Minecraft: Java & Bedrock Edition | Official Site",
    description: "Build, explore, and survive in infinite worlds. Create anything you can imagine with blocks. Join over 140 million players in the ultimate sandbox adventure game.",
    thumbnail: "/minecraft-thumbnail.jpg"
  },
  {
    id: "6",
    siteName: "Rockstar Games",
    siteUrl: "rockstargames.com › games › gtav",
    title: "Grand Theft Auto V - Rockstar Games",
    description: "Explore the sprawling city of Los Santos and Blaine County in the ultimate open-world action-adventure game. Play through an epic story mode or dominate GTA Online with friends.",
    thumbnail: "/gta-v-thumbnail.jpg"
  },
  {
    id: "7",
    siteName: "Epic Games",
    siteUrl: "fortnite.com › news › latest",
    title: "Fortnite - Battle Royale, Build & Creative Modes",
    description: "5 hours ago - Jump into the latest season with new skins, weapons, and map changes. Squad up with friends and be the last one standing in this free-to-play battle royale sensation.",
    thumbnail: "/fortnite-thumbnail.jpg"
  },
  {
    id: "8",
    siteName: "Innersloth",
    siteUrl: "innersloth.com › games › among-us",
    title: "Among Us - Play with 4-15 players online or via local WiFi",
    description: "Who is the impostor? Play the social deduction game that took the world by storm. Complete tasks, find the impostor, or deceive your crewmates in this multiplayer party game.",
    thumbnail: "/among-us-thumbnail.jpg"
  },
  {
    id: "9",
    siteName: "Riot Games",
    siteUrl: "playvalorant.com › en-us › news",
    title: "VALORANT - A 5v5 Character-Based Tactical FPS",
    description: "1 day ago - Master unique agents with powerful abilities in this competitive shooter. Outsmart, outplay, and outshoot opponents in tactical 5v5 matches. New episode drops this week.",
    thumbnail: "/valorant-thumbnail.jpg"
  },
  {
    id: "10",
    siteName: "Riot Games",
    siteUrl: "leagueoflegends.com › news › game-updates",
    title: "League of Legends - The World's Most Popular MOBA",
    description: "3 hours ago - Choose from over 160 champions and battle in the ultimate team-based strategy game. Climb the ranks, master your champion, and compete in the most-watched esport globally.",
    thumbnail: "/league-of-legends-thumbnail.jpg"
  }
];

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchResults.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.siteName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredResults(filtered)
      setShowDropdown(true)
    } else {
      setFilteredResults([])
      setShowDropdown(false)
    }
  }, [searchQuery])

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleResultSelect = (result: SearchResult) => {
    setSearchQuery(result.title)
    setShowDropdown(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (filteredResults.length > 0) {
      handleResultSelect(filteredResults[0])
    }
  }

  const handleInputFocus = () => {
    if (searchQuery.trim()) {
      setShowDropdown(true)
    }
  }

  const navigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome()
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo" onClick={navigateToHome} style={{ cursor: "pointer" }}>
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

          {showDropdown && filteredResults.length > 0 && (
            <div className="search-dropdown show">
              {filteredResults.map((result) => (
                <div key={result.id} className="search-suggestion" onClick={() => handleResultSelect(result)}>
                  <span className="suggestion-text">{result.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <div className="search-results">
          {searchResults.map((result) => (
            <div key={result.id} className="search-result-item">
              <div className="result-content">
                <div className="result-header">
                  <div className="site-info">
                    <div className="site-details">
                      <span className="site-name">{result.siteName}</span>
                      <span className="site-url">{result.siteUrl}</span>
                    </div>
                  </div>
                </div>
                <h3 className="result-title">{result.title}</h3>
                <p className="result-description">{result.description}</p>
              </div>
              <div className="result-thumbnail">
                <img src={result.thumbnail || "/placeholder.svg"} alt={result.title} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default GamesPage
