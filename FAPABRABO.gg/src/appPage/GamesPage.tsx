"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./App.css"

interface SearchResult {
  id: string
  name: string
  publisher: string
  genre: string
  description: string
  thumbnail: string
  siteName: string
  siteUrl: string
  tags?: string[]
}

interface GamesPageProps {
  onNavigateToHome?: () => void
}

const GamesPage: React.FC<GamesPageProps> = ({ onNavigateToHome }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ Auto-load results from state or URL (?q=)
  useEffect(() => {
    const stateQuery = (location.state as { query?: string })?.query
    const params = new URLSearchParams(window.location.search)
    const urlQuery = params.get("q")
    const query = stateQuery || urlQuery
    if (query) {
      setSearchQuery(query)
      fetchSearchResults(query)
    }
  }, [location.state])

  // 🔎 Fetch suggestions
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 🔥 Full backend search
  const fetchSearchResults = async (query: string) => {
    try {
      setHasSearched(true)
      setLoading(true)
      const res = await fetch(`http://127.0.0.1:8000/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.results || [])
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error("Error fetching search results:", err)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  // 🧭 Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleResultSelect = (text: string) => {
    setSearchQuery(text)
    setShowDropdown(false)
    fetchSearchResults(text)
    navigate(`/games?q=${encodeURIComponent(text)}`, { replace: true })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      fetchSearchResults(searchQuery)
      navigate(`/games?q=${encodeURIComponent(searchQuery)}`, { replace: true })
    }
  }

  const handleInputFocus = () => {
    if (searchQuery.trim() && suggestions.length > 0) {
      setShowDropdown(true)
    }
  }

  const navigateToHome = () => {
    if (onNavigateToHome) onNavigateToHome()
    else navigate("/")
  }

  // 🎮 Categories
  const categories = [
    "action",
    "adventure",
    "strategy",
    "simulation",
    "casual",
    "rpg",
    "games",
    "indie",
    "sports",
    "board-games",
    "survival",
  ]

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
              {suggestions.map((result, idx) => {
                const shouldAppend = !result.toLowerCase().startsWith(searchQuery.toLowerCase())
                const fullText = shouldAppend ? `${searchQuery.trim()} ${result}`.trim() : result

                return (
                  <div
                    key={idx}
                    className="search-suggestion"
                    onClick={() => handleResultSelect(fullText)}
                  >
                    <span className="suggestion-text">{fullText}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </header>

      {/* 🔹 Tabs */}
      <nav className="nav-tabs">
        {categories.map((tab) => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab)
              setSearchQuery(tab)
              fetchSearchResults(tab)
              navigate(`/games?q=${encodeURIComponent(tab)}`, { replace: true })
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* 🔹 Main Results */}
      <main className="main-content">
        <div className="search-results">
          {loading ? (
            <p className="loading-text">Loading results...</p>
          ) : hasSearched && searchResults.length === 0 ? (
            <div className="no-results">
              <h2>Page Not Found</h2>
              <p>No games matched your search.</p>
            </div>
          ) : (
            searchResults.map((result) => (
              <div key={result.id} className="search-result-item">
                <div className="result-content">
                  <div className="result-header">
                    <div className="site-info">
                      <div className="site-details">
                        <a
                          className="site-name"
                          href={result.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {result.siteName}
                        </a>
                      </div>
                    </div>
                  </div>

                  <h3 className="result-title">
                    <a
                      href={result.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-title"
                    >
                      {result.name}
                    </a>
                  </h3>

                  <span className="site-genre">{result.genre}</span>
                  {result.tags && <p className="site-tags">Tags: {result.tags.join(", ")}</p>}
                  <p className="publisher-name">Publisher: {result.publisher}</p>
                  <p className="result-description">{result.description}</p>
                </div>

                <div className="result-thumbnail">
                  <img src={result.thumbnail || "/placeholder.svg"} alt={result.name} />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default GamesPage
