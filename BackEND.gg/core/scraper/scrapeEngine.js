import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import fs from "fs";
import { Parser } from "json2csv";   
import { parse } from "csv-parse/sync"
import { vGameScrape } from "./parser/videoGameScraper.js";
import { randomUserAgent } from "./utils/randomUserAgent.js";

const OUTPUT_FILE = "./datasets/all_games.csv";
  
// ------------------------

function loadLinks(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Links file not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, "utf8");
  return content
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith("#")); // skip empty and comments
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchHTML(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const USER_AGENT = randomUserAgent();
  await page.setUserAgent(USER_AGENT);

  await page.goto(url, { waitUntil: "networkidle2" });

  const html = await page.content();
  await browser.close();
  return html;
}

function loadExistingGames(filePath) {
  if (!fs.existsSync(filePath)) return [];

  let data = fs.readFileSync(filePath, "utf8");

  // Remove BOM if present
  if (data.charCodeAt(0) === 0xFEFF) {
    data = data.slice(1);
  }

  return parse(data, {
    columns: true,
    skip_empty_lines: true
  });
}

function cleanText(text) {
  return text ? text.replace(/[\r\n]+/g, " ").trim() : "";
}

function saveGames(filePath, games) {
  const fields = ["name", "genre", "tags", "description", "publisher", "url", "image"];

  // clean up text on description so di mag expand 
  const cleanedGames = games.map(g => ({
    name: g.name,
    genre: g.genre,
    tags: g.tags,
    description: cleanText(g.description),
    publisher: cleanText(g.publisher),
    url: g.url,
    image: g.image
  }));

  const parser = new Parser({ fields });
  const csv = parser.parse(cleanedGames);

  fs.writeFileSync(filePath, "\uFEFF" + csv, "utf8");
  console.log(`Saved ${cleanedGames.length} games to ${filePath}`);
}

// main
async function scrapeAllGames(urls) {
  const allGames = loadExistingGames(OUTPUT_FILE);

  for (const url of urls) {
    const scraperObj = vGameScrape.find(s => s.pattern.test(url));
    if (!scraperObj) {
      console.log(`No scraper found for URL: ${url}`);
      continue;
    }

    try {
      const html = await fetchHTML(url);
      const $ = cheerio.load(html);
      const game = scraperObj.scrape($, url);

      if (!allGames.some(g => g.url === game.url)) {
        allGames.push(game);
        console.log(`Scraped: ${game.name}`);
      } else {
        console.log(`Skipping duplicate: ${game.name}`);
      }
    } catch (err) {
      console.log(`Error scraping ${url}: ${err.message}`);
    }

    const waitTime = Math.floor(Math.random() * 2000) + 2000;
    console.log(`Waiting ${waitTime} ms before next request...`);
    await delay(waitTime);
  }

  saveGames(OUTPUT_FILE, allGames);
}



const linksFile = "./links.txt";
const urls = loadLinks(linksFile);

scrapeAllGames(urls);
