"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import './App.css';
import Footer from './footerSection.tsx'

interface SearchResult {
  id: string
  name: string
  publisher: string
  genre: string
  description: string
  thumbnail: string
  siteName: string
  siteUrl: string
}

type TabType =
  | "action"| "adventure" | "strategy"| "simulation"| "casual" | "rpg" | "games" | "indie" | "sports" | "board-games"| "survival"

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [activeTab, setActiveTab] = useState<TabType>("action")
  const searchRef = useRef<HTMLDivElement>(null)

  // 🔎 Fetch suggestions from backend
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim()) {
        try {
          const res = await fetch(`http://127.0.0.1:8000/suggest?q=${searchQuery}`)
          if (res.ok) {
            const data = await res.json()
            setSuggestions(data.suggestions || [])
            setShowDropdown((data.suggestions || []).length > 0)
          }
        } catch (err) {
          console.error("Error fetching suggestions:", err)
          setSuggestions([])
          setShowDropdown(false)
        }
      } else {
        setSuggestions([])
        setShowDropdown(false)
      }
    }
    fetchSuggestions()
  }, [searchQuery])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // 🔥 Run full search on backend
  const fetchSearchResults = async (query: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/search?q=${query}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.results || [])
      }
    } catch (err) {
      console.error("Error fetching search results:", err)
    }
  }

  const handleResultSelect = (text: string) => {
    setSearchQuery(text)
    setShowDropdown(false)
    fetchSearchResults(text) // run backend search
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      fetchSearchResults(searchQuery)
    }
  }

  const handleInputFocus = () => {
    if (searchQuery.trim() && suggestions.length > 0) {
      setShowDropdown(true)
    }
  }

  const navigateToHome = () => {
    window.location.href = "/"
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

          {showDropdown && suggestions.length > 0 && (
            <div className="search-dropdown show">
              {suggestions.map((result, idx) => (
                <div key={idx} className="search-suggestion" onClick={() => handleResultSelect(result)}>
                  <span className="suggestion-text">{result}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <nav className="nav-tabs">
        <button className={`nav-tab ${activeTab === "action" ? "active" : ""}`} onClick={() => setActiveTab("action")}>
          Action
        </button>
        <button
          className={`nav-tab ${activeTab === "adventure" ? "active" : ""}`}
          onClick={() => setActiveTab("adventure")}
        >
          Adventure
        </button>
        <button
          className={`nav-tab ${activeTab === "strategy" ? "active" : ""}`}
          onClick={() => setActiveTab("strategy")}
        >
          Strategy
        </button>
        <button
          className={`nav-tab ${activeTab === "simulation" ? "active" : ""}`}
          onClick={() => setActiveTab("simulation")}
        >
          Simulation
        </button>
        <button className={`nav-tab ${activeTab === "casual" ? "active" : ""}`} onClick={() => setActiveTab("casual")}>
          Casual
        </button>
        <button className={`nav-tab ${activeTab === "rpg" ? "active" : ""}`} onClick={() => setActiveTab("rpg")}>
          RPG
        </button>
        <button className={`nav-tab ${activeTab === "games" ? "active" : ""}`} onClick={() => setActiveTab("games")}>
          Games
        </button>
        <button className={`nav-tab ${activeTab === "indie" ? "active" : ""}`} onClick={() => setActiveTab("indie")}>
          Indie
        </button>
        <button className={`nav-tab ${activeTab === "sports" ? "active" : ""}`} onClick={() => setActiveTab("sports")}>
          Sports
        </button>
        <button
          className={`nav-tab ${activeTab === "board-games" ? "active" : ""}`}
          onClick={() => setActiveTab("board-games")}
        >
          Board Games
        </button>
        <button
          className={`nav-tab ${activeTab === "survival" ? "active" : ""}`}
          onClick={() => setActiveTab("survival")}
        >
          Survival
        </button>
      </nav>

      <main className="main-content">
        <div className="search-results">
          {searchResults.map((result) => (
            <div key={result.id} className="search-result-item">
              <div className="result-content">
                <div className="result-header">
                  <div className="site-info">
                    <div className="site-details">
                      <a className="site-name" href={result.siteUrl} target="_blank" rel="noopener noreferrer">
                        {result.siteName}
                      </a>
                    </div>
                  </div>
                </div>
                <h3 className="result-title">{result.name}</h3>
                <span className="site-genre">{result.genre}</span>
                <p className="publisher-name">Publisher: {result.publisher}</p>
                <p className="result-description">{result.description}</p>
              </div>
              <div className="result-thumbnail">
                <img src={result.thumbnail || "/placeholder.svg"} alt={result.name} />
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
