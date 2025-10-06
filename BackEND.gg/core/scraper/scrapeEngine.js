import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import fs from "fs";
import { Parser } from "json2csv";
import { parse } from "csv-parse/sync";
import { vGameScrape } from "./parser/videoGameScraper.js";
import { randomUserAgent } from "./utils/randomUserAgent.js";

const OUTPUT_FILE = "./datasets/all_games.csv";
const LINKS_FILE = "./links.txt";
const ERROR_LOG = "./errors.log";





function loadLinks(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Links file not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, "utf8");
  return content
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith("#"));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanText(text) {
  return text ? text.replace(/[\r\n]+/g, " ").trim() : "";
}

function loadExistingGames(filePath) {
  if (!fs.existsSync(filePath)) return [];

  let data = fs.readFileSync(filePath, "utf8");
  if (data.charCodeAt(0) === 0xFEFF) data = data.slice(1);

  try {
    return parse(data, {
      columns: true,
      skip_empty_lines: true
    });
  } catch (err) {
    console.log(`⚠️ Error reading existing CSV: ${err.message}`);
    return [];
  }
}

function saveGames(filePath, games) {
  const fields = ["name", "genre", "tags", "description", "publisher", "url", "image"];
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
  console.log(`💾 Saved ${cleanedGames.length} games to ${filePath}`);
}

function logError(url, err) {
  const message = `${url}}\n`;
  fs.appendFileSync(ERROR_LOG, message);
}


async function fetchHTML(browser, url) {
  const page = await browser.newPage();
  const USER_AGENT = randomUserAgent();
  await page.setUserAgent(USER_AGENT);

  await page.goto(url, { waitUntil: "networkidle2" });

  //  expand the game description if it exists
  try {
    const expandBtn = await page.$('.truncate-text-2__more');
    if (expandBtn) {
      await expandBtn.click();
      await page.waitForSelector('.truncate-text-2__less', { timeout: 3000 });
      console.log("🟢 Expanded full description");
    }
  } catch (err) {
    console.log("⚠️ Could not expand 'Read more':", err.message);
  }


  await delay(1000);

  const html = await page.content();
  await page.close();
  return html;
}


async function scrapeAllGames(urls) {
  const allGames = loadExistingGames(OUTPUT_FILE);
  const browser = await puppeteer.launch({ headless: true });

  for (const url of urls) {
    const scraperObj = vGameScrape.find(s => s.pattern.test(url));
    if (!scraperObj) {
      console.log(`⚠️ No scraper found for URL: ${url}`);
      continue;
    }
   
    try {
      console.log(`🕹️ Scraping: ${url}`);
      const html = await fetchHTML(browser, url);
      const $ = cheerio.load(html);
      const game = scraperObj.scrape($, url);

      // Validation
      if (!game || !game.name || !game.url) {
        console.log(`⚠️ Invalid or missing data for ${url}`);
        continue;
      }

      // Avoid duplicates
      if (!allGames.some(g => g.url === game.url || g.name === game.name)) {
        allGames.push(game);
        console.log(`✅ Added: ${game.name}`);
      } else {
        console.log(`⏩ Duplicate skipped: ${game.name}`);
      }
    } catch (err) {
      console.log(`❌ Error scraping ${url}: ${err.message}`);
      logError(url);
    }

   
    const waitTime = Math.floor(Math.random() * 3000) + 2000;
    console.log(`⏳ Waiting ${waitTime} ms before next request...`);
    await delay(waitTime);
  }

  await browser.close();
  saveGames(OUTPUT_FILE, allGames);
}



const urls = loadLinks(LINKS_FILE);
if (urls.length === 0) {
  console.log("⚠️ No URLs found in links.txt");
  process.exit(1);
}

scrapeAllGames(urls);
