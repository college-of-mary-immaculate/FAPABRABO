import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import fs from "fs";
import { randomUserAgent } from "./utils/randomUserAgent.js";

const BASE_URL = "https://rawg.io";
const TARGET_URL = "https://rawg.io/search?query=old"; // starting point
const LINKS_FILE = "./links.txt";

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function saveLinks(links) {
  const unique = [...new Set(links)];
  fs.writeFileSync(LINKS_FILE, unique.join("\n"), "utf8");
  console.log(`💾 Saved ${unique.length} links to ${LINKS_FILE}`);
}

async function fetchHTML(browser, url) {
  const page = await browser.newPage();
  const USER_AGENT = randomUserAgent();
  await page.setUserAgent(USER_AGENT);
  console.log(`🌐 Visiting: ${url}`);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  await delay(1500);
  const html = await page.content();
  await page.close();
  return html;
}

async function scrapeRAWGGameLinks(pages = 3) {
  const browser = await puppeteer.launch({ headless: true });
  let allLinks = [];

  for (let i = 1; i <= pages; i++) {
    const pageUrl = `${TARGET_URL}?page=${i}`;
    console.log(`📄 Scraping page ${i}...`);
    const html = await fetchHTML(browser, pageUrl);
    const $ = cheerio.load(html);

    $(".game-card-medium__info__name").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.startsWith("/games/")) {
        allLinks.push(BASE_URL + href);
      }
    });

    console.log(`✅ Found ${allLinks.length} links so far...`);
    await delay(Math.floor(Math.random() * 2000) + 2000);
  }

  await browser.close();
  saveLinks(allLinks);
}

scrapeRAWGGameLinks(6).catch(err => console.error("❌ Error:", err.message));
