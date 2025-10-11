"use client";

import React, { useState, useEffect } from "react";
import "../appPage/App.css";

interface Publisher {
  rank: number;
  publisher: string;
  count: number;
  image_url: string; // ✅ added
}

export default function GamesPageTop() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/toplowest");
        if (res.ok) {
          const data = await res.json();
          setPublishers(data.top_25_publishers || []);
        } else {
          console.error("Failed to load publishers.");
        }
      } catch (err) {
        console.error("Error fetching publishers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishers();
  }, []);

  const navigateToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo" onClick={navigateToHome} style={{ cursor: "pointer" }}>
          GAMEGLE
        </div>
        <h2 className="page-title">TOP 25 PUBLISHERS</h2>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <p className="loading-text">Loading publishers...</p>
        ) : (
          <div className="publisher-grid">
            {publishers.map((pub) => (
              <div
                key={pub.rank}
                className="publisher-card"
                onClick={() => window.location.href = `/gamesPage/${encodeURIComponent(pub.publisher)}`}

                style={{ cursor: "pointer" }}
                >
                <div className="card-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>

                {/* ✅ Added image */}
                <img
                  src={pub.image_url}
                  alt={pub.publisher}
                  className="publisher-image"
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg")
                  }
                />

                <div className="card-content">
                  <h3 className="pub-rank">#{pub.rank}</h3>
                  <h3 className="pub-name">{pub.publisher}</h3>
                  <p className="pub-count">{pub.count} Games</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
