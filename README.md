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
