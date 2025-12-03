const fs = require("fs");
const puppeteer = require("puppeteer");

const CATEGORY_URLS = [
  "https://fallout.fandom.com/wiki/Category:Fallout_2_characters",
  "https://fallout.fandom.com/wiki/Category:Fallout_3_human_characters",
  "https://fallout.fandom.com/wiki/Category:Fallout:_New_Vegas_human_characters",
];

async function collectCharacterUrlsFromCategory(page, categoryUrl) {
  console.log(`Collecting from category: ${categoryUrl}`);
  await page.goto(categoryUrl, { waitUntil: "networkidle2" });

  const urls = await page.evaluate(() => {
    const links = [];

    const anchors = Array.from(
      document.querySelectorAll(
        ".category-page__members .category-page__members-wrapper .category-page__members-for-char li.category-page__member a.category-page__member-link"
      )
    );

    for (const a of anchors) {
      const href = a.getAttribute("href");
      if (!href) continue;

      if (!href.startsWith("/wiki/")) continue;

      if (
        href.startsWith("/wiki/Category:") ||
        href.startsWith("/wiki/File:") ||
        href.startsWith("/wiki/Template:")
      ) {
        continue;
      }

      links.push(new URL(href, location.origin).href);
    }

    return Array.from(new Set(links));
  });

  console.log(`Found ${urls.length} character URLs in this category`);
  return urls;
}

async function scrapeCharacter(page, url) {
  await page.goto(url, { waitUntil: "networkidle2" });

  const data = await page.evaluate(() => {
    const result = {};

    const titleEl =
      document.querySelector("#firstHeading") || document.querySelector("h1");
    result.name = titleEl ? titleEl.textContent.trim() : null;

    const infobox = document.querySelector(".portable-infobox");
    if (infobox) {
      const rows = infobox.querySelectorAll(".pi-item.pi-data");
      rows.forEach((row) => {
        const labelEl = row.querySelector(".pi-data-label");
        const valueEl = row.querySelector(".pi-data-value");
        if (!labelEl || !valueEl) return;

        const key = labelEl.textContent
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");
        const value = valueEl.textContent.trim();
        result[key] = value;
      });

      const imgEl = infobox.querySelector("img");
      if (imgEl && imgEl.src) {
        result.image = imgEl.src;
      }
    }

    const descEl = document.querySelector(".mw-parser-output > p");
    if (descEl) {
      result.description = descEl.textContent.trim();
    }

    return result;
  });

  data.url = url;
  return data;
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const allUrlsSet = new Set();
  for (const categoryUrl of CATEGORY_URLS) {
    try {
      const urls = await collectCharacterUrlsFromCategory(page, categoryUrl);
      urls.forEach((u) => allUrlsSet.add(u));
    } catch (err) {
      console.error("Error collecting from category:", categoryUrl, err.message);
    }
  }

  const allUrls = Array.from(allUrlsSet);
  console.log(`Total unique character URLs collected: ${allUrls.length}`);

  const results = [];

  for (const url of allUrls) {
    console.log("Scraping:", url);
    try {
      const charData = await scrapeCharacter(page, url);
      results.push(charData);
      fs.writeFileSync("fallout-characters.json",JSON.stringify(results, null, 2),"utf-8");
      console.log("Saved fallout-characters.json");
    } catch (err) {
      console.error("Error scraping", url, err.message);
    }
    await new Promise((res) => setTimeout(res, 1000));
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
