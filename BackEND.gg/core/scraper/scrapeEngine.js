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
  "https://rawg.io/games/deponia-doomsday",
  "https://rawg.io/games/nightsky",
  "https://rawg.io/games/do-not-feed-the-monkeys",
  "https://rawg.io/games/the-room",
  "https://rawg.io/games/we-were-here-too",
  "https://rawg.io/games/obduction",
  "https://rawg.io/games/we-were-here-together",
  "https://rawg.io/games/virus-named-tom-a",
  "https://rawg.io/games/grimm",
  "https://rawg.io/games/quantum-conundrum",
  "https://rawg.io/games/bejeweled-3",
  "https://rawg.io/games/portal",
  "https://rawg.io/games/inside",
  "https://rawg.io/games/lara-croft-and-the-temple-of-osiris",
  "https://rawg.io/games/grim-fandango-remastered",
  "https://rawg.io/games/human-fall-flat",
  "https://rawg.io/games/orwell",
  "https://rawg.io/games/gris",
  "https://rawg.io/games/machinarium",
  "https://rawg.io/games/world-of-goo",
  "https://rawg.io/games/unravel",
  "https://rawg.io/games/spacechem",
  "https://rawg.io/games/we-were-here",
  "https://rawg.io/games/unravel-two",
  "https://rawg.io/games/catherine",
  "https://rawg.io/games/little-inferno",
  "https://rawg.io/games/untitled-goose-game",
  "https://rawg.io/games/portal-stories-mel",
  "https://rawg.io/games/mini-metro",
  "https://rawg.io/games/back-to-the-future-the-game",
  "https://rawg.io/games/pony-island",
  "https://rawg.io/games/qube-directors-cut",
  "https://rawg.io/games/broken-sword-1-dc-espanol",
  "https://rawg.io/games/lara-croft-go",
  "https://rawg.io/games/supraland",
  "https://rawg.io/games/teslagrad",
  "https://rawg.io/games/back-to-bed",
  "https://rawg.io/games/poly-bridge",
  "https://rawg.io/games/old-mans-journey",
  "https://rawg.io/games/the-whispered-world-special-edition",
  "https://rawg.io/games/osmos",
  "https://rawg.io/games/portal-with-rtx",
  "https://rawg.io/games/and-yet-it-moves",
  "https://rawg.io/games/lego-star-wars-tfa",
  "https://rawg.io/games/syberia-3",
  "https://rawg.io/games/time-gentlemen-please-and-ben-there-dan-that-speci",
  "https://rawg.io/games/eets-munchies",
  "https://rawg.io/games/papo-yo",
  "https://rawg.io/games/broken-sword-ii-the-smoking-mirror",
  "https://rawg.io/games/edge",
  "https://rawg.io/games/lego-jurassic-world",
  "https://rawg.io/games/limbo",
  "https://rawg.io/games/trine-2-complete-story",
  "https://rawg.io/games/fez",
  "https://rawg.io/games/the-witness",
  "https://rawg.io/games/stray-2",
  "https://rawg.io/games/broken-age",
  "https://rawg.io/games/deponia",
  "https://rawg.io/games/valiant-hearts-the-great-war",
  "https://rawg.io/games/vvvvvv",
  "https://rawg.io/games/scribblenauts-unlimited",
  "https://rawg.io/games/littlebigplanet-3",
  "https://rawg.io/games/her-story",
  "https://rawg.io/games/antichamber",
  "https://rawg.io/games/stealth-inc-2-game-of-clones",
  "https://rawg.io/games/tricky-towers",
  "https://rawg.io/games/superliminal",
  "https://rawg.io/games/pid",
  "https://rawg.io/games/plants-vs-zombies",
  "https://rawg.io/games/the-escapists",
  "https://rawg.io/games/figment",
  "https://rawg.io/games/magrunner-dark-pulse",
  "https://rawg.io/games/stacking",
  "https://rawg.io/games/trine-4-the-nightmare-prince",
  "https://rawg.io/games/i-have-no-mouth-and-i-must-scream-2",
  "https://rawg.io/games/the-pillars-of-the-earth",
  "https://rawg.io/games/puzzle-agent-2",
  "https://rawg.io/games/hexic-hd",
  "https://rawg.io/games/the-cave",
  "https://rawg.io/games/donut-county",
  "https://rawg.io/games/the-unfinished-swan",
  "https://rawg.io/games/tetris-effect-connected",
  "https://rawg.io/games/cogs",
  "https://rawg.io/games/call-of-the-sea",
  "https://rawg.io/games/mcpixel",
  "https://rawg.io/games/the-silent-age",
  "https://rawg.io/games/hello-neighbor",
  "https://rawg.io/games/strange-brigade",
  "https://rawg.io/games/tis-100",
  "https://rawg.io/games/closure",
  "https://rawg.io/games/vessel"
];

scrapeAllGames(urls);
