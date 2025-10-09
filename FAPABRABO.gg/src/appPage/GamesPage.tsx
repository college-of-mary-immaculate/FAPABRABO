"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
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
      setHasSearched(true)
      setLoading(true)
      const res = await fetch(`http://127.0.0.1:8000/search?q=${query}`)
      if (res.ok) {
        const data = await res.json()
        console.log("Backend raw response:", data)
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

  // 🧭 Auto-load results if URL has ?q= parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const query = params.get("q")
    if (query) {
      setSearchQuery(query)
      fetchSearchResults(query)
    }
  }, [])

  const handleResultSelect = (text: string) => {
    setSearchQuery(text)
    setShowDropdown(false)
    fetchSearchResults(text)
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
    if (onNavigateToHome) onNavigateToHome()
    else window.location.href = "/"
  }

  return (
    <div className="container">
      <header className="header">
        <div
          className="logo"
          onClick={navigateToHome}
          style={{ cursor: "pointer" }}
        >
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
                const fullText = shouldAppend
                  ? `${searchQuery.trim()} ${result}`.trim()
                  : result

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
                  <span className="site-genre">{result.genre}</span>
                  <p className="site-tags">Tags: {result.tags}</p>
                  <p className="publisher-name">Publisher: {result.publisher}</p>
                  <p className="result-description">{result.description}</p>
                </div>
                <div className="result-thumbnail">
                  <img
                    src={result.thumbnail || "/placeholder.svg"}
                    alt={result.name}
                  />
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
