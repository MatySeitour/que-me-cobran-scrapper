import puppeteer from "puppeteer";
import log from "./utils/log.js";
import { PrismaClient } from "@prisma/client";
import discordMessage from "./utils/discord_message.js";
import sleep from "./utils/sleep.js";
import onlyHtml from "./utils/only_html.js";

const prisma = new PrismaClient();

const star = async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();
        await onlyHtml(page)
        await page.goto("https://www.flow.com.ar/plataformas-de-streaming/star-plus");
        await sleep(2000);
        await page.waitForSelector(".feature-and-price__success--price");
        const result = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                if (price) {
                    arr.push(price.innerText);
                }
            }
            return arr;
        }, ".feature-and-price__success--price");


        await page.waitForSelector(".price__number");
        const result2 = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                if (price) {
                    arr.push(price.innerText);
                }
            }
            return arr;
        }, ".price__number");

        await onlyHtml(page)
        await page.goto("https://selectra.com.ar/streaming/star-plus");
        await sleep(2000);
        await page.waitForSelector("#content-with-summary > div:nth-child(1) > div:nth-child(5) > div.table--swap.table--responsive > table > tbody > tr > td:nth-child(2)");
        const result3 = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                if (price) {
                    arr.push(price.innerText);
                }
            }
            return arr;
        }, "#content-with-summary > div:nth-child(1) > div:nth-child(5) > div.table--swap.table--responsive > table > tbody > tr > td:nth-child(2)");

        const data = [
            {
                name: "Star+/1 mes",
                id: 70,
                price: (Number(result.join("").split("$")[1]) / 1.74).toFixed(0),
                benefits: "Puedes acceder a estrenos de películas, series y eventos deportivos de ESPN en cualquier dispositivo por 1 mes."
            },
            {
                name: "Star+ - Disney+/1 mes",
                id: 71,
                price: (Number(result2.join("").split("$")[1].replace(/[.]/g, "")) / 1.74).toFixed(0),
                benefits: "Puedes acceder a estrenos de películas, series y eventos deportivos de ESPN en cualquier dispositivo por 1 mes. Puedes acceder a contenido de Disney+",
            },
            {
                name: "Star+, Disney+, y LIONSGATE+/1 mes",
                id: 72,
                price: ((Number(Array(result3.join("").split(" ")[0]).join("").split("$")[1].replace(/[.]/g, "")) / 1.74)).toFixed(0),
                benefits:
                    "Puedes acceder a estrenos de películas, series y eventos deportivos de ESPN en cualquier dispositivo por 1 mes. Puedes acceder a contenido de Disney+. Puedes acceder a contenido de Lionsgate+",
            }
        ]


        await browser.close()

        for (const plan of data) {
            log("empieza a ejecutar star")
            await prisma.plan.update({
                where: {
                    id: plan.id,
                },
                data: {
                    name: plan.name,
                    price: Number(plan.price),
                    benefits: plan.benefits
                },
            });
        }

        console.log(data)
    }
    catch (e) {
        await browser.close()
        await discordMessage("Star+", e)
        console.error(e)
    }
}


export default star;