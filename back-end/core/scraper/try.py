import asyncio
import json
import random
from playwright.async_api import async_playwright

async def scrape_rawg():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # Set user agent
        user_agent = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
        
        context = await browser.new_context(user_agent=user_agent)
        page = await context.new_page()

        # Navigate to RAWG games page
        await page.goto("https://rawg.io/games")
        await page.wait_for_selector(".game-card")

        # Infinite scroll simulation (load more games)
        for _ in range(5):  # adjust for more data
            await page.mouse.wheel(0, 2000)
            # Add random delay between scrolls
            await page.wait_for_timeout(random.randint(2000, 4000))

        # Select all game cards
        games = await page.query_selector_all(".game-card")

        results = []
        for game in games:
            # Random delay before scraping each card
            await page.wait_for_timeout(random.randint(500, 1500))

            title = await game.query_selector_eval(".game-card__title", "el => el.textContent") if await game.query_selector(".game-card__title") else None
            link = await game.query_selector_eval("a", "el => el.href") if await game.query_selector("a") else None
            image = await game.query_selector_eval("img", "el => el.src") if await game.query_selector("img") else None
            genre = await game.query_selector_eval(".game-card__meta", "el => el.textContent") if await game.query_selector(".game-card__meta") else None
            publisher = None  # needs detail-page scraping later

            results.append({
                "title": title.strip() if title else None,
                "link": link,
                "image": image,
                "genre": genre.strip() if genre else None,
                "publisher": publisher
            })

        # Save results to JSON
        with open("rawg_games.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=4, ensure_ascii=False)

        print(f"Scraped {len(results)} games with delays + custom User-Agent.")
        await browser.close()

asyncio.run(scrape_rawg())
