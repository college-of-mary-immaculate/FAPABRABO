# 🎮 Games Search Engine Project

## 🎯 Project Overview

- **Problem:** Gamers struggle to find relevant content across scattered gaming websites.  
- **Solution:** A specialized search engine that aggregates and indexes gaming content for fast, accurate search results.  
- **Value:** One-stop search destination for gaming content with smart filtering and ranking.  

---

## 👥 Team Structure

| Role | Member | Responsibility |
| --- | --- | --- |
| Project Lead | @Jet Padilla | Coordination & Architecture |
| Data Engineer | John Paul Bodino | Web scraping & Preprocessing |
| Search Engineer | Nathaniel Faborada | TF-IDF & Retrieval |
| ML Engineer | Diether Pano | Content Classification |
| Frontend Engineer | Genniesys Bracia | UI & API Development |

---

## 📊 Data Pipeline

### Sources
- Gaming news sites (RAWG)  

### Processing Steps
1. **Web Scraping** → Clean HTML, extract text  
2. **Text Cleaning** → Remove stopwords, normalize text  
3. **Tokenization** → Split into meaningful terms  
4. **Feature Extraction** → Generate TF-IDF vectors  
5. **Classification** → Label content type (news/review/guide)  

---

## 🔧 Technical Architecture

> **Flow:** Web Data → Scraper → Preprocessor → TF-IDF Engine → Classifier → Search API → Web UI  

### Core Technologies
- **Backend:** Python, FastAPI 
- **Database:** MongoDB (On-Hold)
- **Frontend:** React.js  
- **Deployment:** Docker containers (On-Hold)  

---

## 🧠 Machine Learning Models

### Classification Models Tested

| Model | Accuracy | Speed | Memory |
| --- | --- | --- | --- |
| Naive Bayes | 85% | Fast | Low |

✅ **Selected:** Linear SVM (best accuracy-performance balance)

### Search Features
- **TF-IDF Ranking:** Relevance scoring based on term importance  
- **N-gram Autosuggestion:** Smart search completion  
- **Content Filtering:** Filter by type (news, ratings)  

---

## 🎯 Key Features

### Search Capabilities
- **Keyword Search** with relevance ranking  
- **Auto-complete** suggestions while typing  
- **Content Type Filtering** (news/reviews/guides/discussions)  
- **Game-specific Search** for targeted results    

---

## 🚀 Demo Scenarios
1. **Game News Search:** `"cyberpunk 2077 updates"`  
2. **Ratings Lookup:** `"best indie games 2024"`

---

## 🗓️ Timeline in the Production

> Proposed schedule as of **September 26, 2025**. Adjust as needed.

### Phase 1 — Planning & Setup   
- **Outcomes:** Finalize scope, milestones, and infra plan. Create repos and CI.

### Phase 2 — Data Ingestion Pipeline  
- **Outcomes:** Scrapers for IGN, GameSpot, PC Gamer. Website UI. Basic monitoring. 

---
