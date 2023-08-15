import puppeteer from "puppeteer";
import log from "./utils/log.js";
import { PrismaClient } from "@prisma/client";
import discordMessage from "./utils/discord_message.js";
import sleep from "./utils/sleep.js";
import onlyHtml from "./utils/only_html.js";

const prisma = new PrismaClient();

const hbo = async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await onlyHtml(page);
        await page.goto("https://www.hbomax.com/ar/es", { waitUntil: 'networkidle0' }, { timeout: 1000 });
        const data = await page.evaluate(() => document.querySelector('*').outerHTML);

        console.log(data);
        await browser.close();
    }
    catch (e) {
        await discordMessage("HBO", e)
        console.error(e);
        await browser.close();
    }

}

export default hbo;