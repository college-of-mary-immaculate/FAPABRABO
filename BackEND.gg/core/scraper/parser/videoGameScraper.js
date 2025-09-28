// For video game scraping
export const SteamScraper = {
  pattern: /steampowered\.com/,
  scrape: ($, url) => {
    const name = $("#appHubAppName").text().trim() || $("h1").first().text().trim() || $('meta[property="og:title"]').attr("content") || null;
    const description = $("meta[property='og:description']").attr("content") || $("p").first().text().trim() || null;

    const genre = [];
    $("a[href*='/genre/']").each((i, el) => {
      genre.push($(el).text().trim());
    });


    const publisher = $("a[href*='publisher'], .publisher, .dev_row a").first().text().trim() || null;

    const image = $(".game_header_image_full").attr("src") || $("img.cover, .game_header_image img, meta[property='og:image']").attr("src") || null;

    return { name, genre, description, publisher, url, image };
  }
};

export const RAWGScraper = {
  pattern: /rawg\.io/,
  scrape: ($, url) => {
    const name = $("h1[itemprop='name'].heading_1.game__title").text().trim() || null;

    const description = $("div[itemprop='description'].game__about-text span") .text().trim() ||
  null;
    
    const genre = [];
      $("div.game__meta-block")
        .has("div.game__meta-title:contains('Genre')")
        .find("div.game__meta-text a.game__meta-filter-link")
        .each((i, el) => {
          genre.push($(el).text().trim());
        });

    const publisher = $("meta[itemprop='publisher']").attr("content") || $("a.game__meta-filter-link[href*='/publishers/']").first().text().trim() || null;



    let image = null;
    image = $("meta[itemprop='image']").attr("content") || null;

    console.log(image);
    
    return { name, genre, description, publisher, url, image };
  }
};

export const vGameScrape = [SteamScraper, RAWGScraper];
