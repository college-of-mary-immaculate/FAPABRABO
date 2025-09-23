import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import fs from "fs";
import { vGameScrape } from "./parser/videoGameScraper.js";
import { randomUserAgent } from "./utils/randomUserAgent.js";

const OUTPUT_FILE = "all_games.json";
// ------------------------

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchHTML(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Pick a random user agent per scrape
  const USER_AGENT = randomUserAgent();
  await page.setUserAgent(USER_AGENT);

  await page.goto(url, { waitUntil: "networkidle2" });
  const html = await page.content();
  await browser.close();
  return html;
}

function loadExistingGames(filePath) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

function saveGames(filePath, games) {
  fs.writeFileSync(filePath, JSON.stringify(games, null, 2), "utf8");
  console.log(`Saved ${games.length} games to ${filePath}`);
}

//main///
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

      // Prevent duplicate entries by URL
      if (!allGames.some(g => g.url === game.url)) {
        allGames.push(game);
        console.log(`Scraped: ${game.name}`);
      } else {
        console.log(`Skipping duplicate: ${game.name}`);
      }
    } catch (err) {
      console.log(`Error scraping ${url}: ${err.message}`);
    }

    const waitTime = Math.floor(Math.random() * 2000) + 1000;
    console.log(`Waiting ${waitTime} ms before next request...`);
    await delay(waitTime);
  }

  saveGames(OUTPUT_FILE, allGames);
}


// Example usage
//NOTE: mostly more compatible sa rawg.io and steampowered eme eme
const urls = [
  "https://store.steampowered.com/app/281990/Stellaris/",
  "https://rawg.io/games/vampire-the-masquerade-bloodlines-2",
  "https://store.steampowered.com/app/2507950/Delta_Force/"
];

scrapeAllGames(urls);
