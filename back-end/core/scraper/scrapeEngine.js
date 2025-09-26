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
   "https://rawg.io/games/wheel-world",
  "https://rawg.io/games/whisper-of-the-house",
  "https://rawg.io/games/childhood-friends",
  "https://rawg.io/games/ritual-of-raven",
  "https://rawg.io/games/fill-up-the-hole",
  "https://rawg.io/games/keep-on-mining",
  "https://rawg.io/games/voidbreaker-2",
  "https://rawg.io/games/the-rpg-2",
  "https://rawg.io/games/prison-escape-simulator-dig-out",
  "https://rawg.io/games/and-roger",
  "https://rawg.io/games/prince-of-persia-the-sands-of-time-remake",
  "https://rawg.io/games/slime-rancher-2",
  "https://rawg.io/games/grand-theft-aito-vi",
  "https://rawg.io/games/hell-is-us",
  "https://rawg.io/games/star-citizen",
  "https://rawg.io/games/cronos-the-new-dawn",
  "https://rawg.io/games/arc-raiders",
  "https://rawg.io/games/the-rogue-prince-of-persia",
  "https://rawg.io/games/the-dark-pictures-directive-8020",
  "https://rawg.io/games/dying-light-the-beast",
  "https://rawg.io/games/battlefield-6-2",
  "https://rawg.io/games/donkey-kong-bananza",
  "https://rawg.io/games/rue-valley",
  "https://rawg.io/games/gears-of-war-reloaded",
  "https://rawg.io/games/cairn",
  "https://rawg.io/games/metal-eden",
  "https://rawg.io/games/kingmakers",
  "https://rawg.io/games/mecha-break",
  "https://rawg.io/games/call-of-duty-black-ops-7",
  "https://rawg.io/games/no-im-not-a-human",
  "https://rawg.io/games/lego-voyagers",
  "https://rawg.io/games/drill-core",
  "https://rawg.io/games/sonic-racing-crossworlds",
  "https://rawg.io/games/bad-cheese",
  "https://rawg.io/games/ea-sports-fc-26",
  "https://rawg.io/games/megabonk",
  "https://rawg.io/games/assassins-creed-shadows-claws-of-awaji",
  "https://rawg.io/games/ninja-gaiden-ragebound",
  "https://rawg.io/games/project-echoes-of-the-end",
  "https://rawg.io/games/lord-of-the-rings-the-white-council",
  "https://rawg.io/games/mycopunk",
  "https://rawg.io/games/artis-impact",
  "https://rawg.io/games/killing-floor-3",
  "https://rawg.io/games/static-dread-the-lighthouse",
  "https://rawg.io/games/stronghold-crusader-definitive-edition",
  "https://rawg.io/games/story-of-seasons-grand-bazaar",
  "https://rawg.io/games/terminull-brigade",
  "https://rawg.io/games/dungeons-dragons-neverwinter-nights-2-enhanced-edi",
  "https://rawg.io/games/kaelaverse-pemascape",
  "https://rawg.io/games/oxide-room-208"
]
;

scrapeAllGames(urls);
