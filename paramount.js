import puppeteer from "puppeteer";

const paramount = async () => {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();
    await page.goto("https://www.paramountplus.com/ar/");
    await page.waitForSelector("#main-container > section.hero.aa-section.aa-primary-upsell.illuminate > section > div > div > div.upsell-text > strong");
    const result = await page.evaluate((prices) => {
        let arr = [];
        const pricesNetflix = document.querySelectorAll(prices);
        for (const price of pricesNetflix) {
            if (price) {
                arr.push(price.innerText);
            }
        }
        return arr;
    }, "#main-container > section.hero.aa-section.aa-primary-upsell.illuminate > section > div > div > div.upsell-text > strong");

    const priceParamount = Array(result).join("").split("$")[1].split("al")[0];


}

paramount();

export default paramount;