import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import fs from "fs";
import { Parser } from "json2csv";   
import { parse } from "csv-parse/sync"
import { vGameScrape } from "./parser/videoGameScraper.js";
import { randomUserAgent } from "./utils/randomUserAgent.js";

const OUTPUT_FILE = "all_games.csv";  
// ------------------------

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
  const fields = ["name", "genre", "description", "publisher", "url", "image"];

  // clean up text on description so di mag expand 
  const cleanedGames = games.map(g => ({
    name: g.name,
    genre: g.genre,
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

const urls = [
   "https://rawg.io/games/luto",
  "https://rawg.io/games/patapon-12-replay",
  "https://rawg.io/games/split-3",
  "https://rawg.io/games/last-report",
  "https://rawg.io/games/shadow-labyrinth",
  "https://rawg.io/games/otherskin",
  "https://rawg.io/games/day-of-the-shell-prologue",
  "https://rawg.io/games/dont-fool-me-beauties",
  "https://rawg.io/games/dungeon-stalkers",
  "https://rawg.io/games/hotel-barcelona",
  "https://rawg.io/games/hollow-knight-silksong",
  "https://rawg.io/games/replaced",
  "https://rawg.io/games/mafia-the-old-country",
  "https://rawg.io/games/the-outer-worlds-2",
  "https://rawg.io/games/silent-hill-f",
  "https://rawg.io/games/crimson-desert",
  "https://rawg.io/games/wuchang-fallen-feathers",
  "https://rawg.io/games/in-the-valley-of-gods-2",
  "https://rawg.io/games/lost-soul-aside",
  "https://rawg.io/games/resident-evil-9-requiem",
  "https://rawg.io/games/titan-quest-2",
  "https://rawg.io/games/reanimal",
  "https://rawg.io/games/the-drifter",
  "https://rawg.io/games/pokemon-legends-z-a",
  "https://rawg.io/games/shinobi-art-of-vengeance",
  "https://rawg.io/games/metroid-prime-4-beyond",
  "https://rawg.io/games/heretic-hexen",
  "https://rawg.io/games/painkiller-2",
  "https://rawg.io/games/the-king-is-watching",
  "https://rawg.io/games/dispatch-2",
  "https://rawg.io/games/cairn-2025",
  "https://rawg.io/games/trails-in-the-sky-1st-chapter",
  "https://rawg.io/games/mage-arena-3",
  "https://rawg.io/games/wreckreation",
  "https://rawg.io/games/baby-steps",
  "https://rawg.io/games/let-them-trade",
  "https://rawg.io/games/shape-of-dreams-2",
  "https://rawg.io/games/the-wandering-village",
  "https://rawg.io/games/marathon-2",
  "https://rawg.io/games/tony-hawks-pro-skater-3-4"
];

scrapeAllGames(urls);
