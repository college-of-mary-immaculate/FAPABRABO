"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../appPage/App.css";

interface Game {
  name: string;
  genre: string;
  publisher: string;
  description: string;
  image: string;
  url?: string;
}

export default function PublisherDetail() {
  const { name } = useParams();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");

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
  ];

  // ✅ Fetch all games of this publisher (default)
  useEffect(() => {
    if (!name) return;

    const fetchGames = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/publisher/${name}`);
        if (res.ok) {
          const data = await res.json();
          setGames(data.games || []);
        }
      } catch (err) {
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [name]);

  // ✅ Handle Category Click
  const handleCategoryClick = async (category: string) => {
    setActiveCategory(category);
    setLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/publisher/${name}/${category}`
      );
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      } else {
        console.error("Failed to fetch games for category:", category);
      }
    } catch (err) {
      console.error("Error fetching category games:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header
          className="header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
          }}
        >
          {/* 🔹 Left section: Logo and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              onClick={() => (window.location.href = "/")}
              className="logo"
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1.5rem",
                background: "linear-gradient(to right, #ff4dcf, #4d9fff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              GAMEGLE
            </div>

            <h2 className="page-title" style={{ fontSize: "1.2rem", color: "#fff" }}>
              {decodeURIComponent(name || "")}
            </h2>
          </div>

          {/* 🔹 Right section: Return button */}
          <button
            onClick={() => window.history.back()}
            className="return-button"
            style={{
              backgroundColor: "#0078ff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#005fcc")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0078ff")}
          >
            ← Return
          </button>
        </header>


      

      {/* 🔹 Tabs */}
      <nav className="nav-tabs">
        {categories.map((tab) => (
          <button
            key={tab}
            className={`nav-tab ${activeCategory === tab ? "active" : ""}`}
            onClick={() => handleCategoryClick(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Content */}
      {loading ? (
        <p className="loading-text">Loading games...</p>
      ) : (
        <div className="search-results">
          {games.length === 0 ? (
            <p>No games found for this category.</p>
          ) : (
            games.map((g, i) => (
              <div key={i} className="search-result-item flex">
                <div className="result-content">
                  {/* 🔹 Game Title */}
                  <h3 className="result-title">
                    <a
                      href={g.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-title"
                    >
                      {g.name}
                    </a>
                  </h3>

                  {/* 🔹 Genre */}
                  <span className="site-genre">
                    {(() => {
                      try {
                        const parsed = JSON.parse(g.genre);
                        return Array.isArray(parsed)
                          ? parsed.join(", ")
                          : g.genre;
                      } catch {
                        return g.genre;
                      }
                    })()}
                  </span>

                  {/* 🔹 Publisher */}
                  <p className="publisher-name">
                    Publisher: {g.publisher || "Unknown"}
                  </p>

                  {/* 🔹 Description */}
                  <p className="result-description">{g.description}</p>
                </div>

                {/* 🔹 Image */}
                <div className="result-thumbnail">
                  {g.image && (
                    <img
                      src={g.image}
                      alt={g.name}
                      className="game-thumbnail"
                      style={{
                        width: "200px",
                        height: "120px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
