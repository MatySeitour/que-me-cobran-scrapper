import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import log from "./utils/log.js";

const prisma = new PrismaClient();

const paramount = async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', interceptedRequest => {
            if (interceptedRequest.isInterceptResolutionHandled()) return;
            if (
                interceptedRequest.url().split("?")[0].endsWith('.mp4') ||
                interceptedRequest.url().split("?")[0].endsWith('.svg') ||
                interceptedRequest.url().split("?")[0].endsWith('.png') ||
                interceptedRequest.url().split("?")[0].endsWith('.jpg')

            )
                interceptedRequest.abort();
            else interceptedRequest.continue();
        });
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

        await browser.close();

        const priceParamount = Array(result).join("").split("$")[1].split("al")[0];

        let data = [
            {
                name: "1 mes",
                price: Number(priceParamount),
                id: 68,
                benefits: "Puedes ver películas y series de Paramount, Nickelodeon, MTV y más desde cualquier dispositivo y descargar contenido por 1 mes",
            },
            {
                name: "1 año",
                price: Number(priceParamount) * 12,
                id: 69,
                benefits: "Puedes ver películas y series de Paramount, Nickelodeon, MTV y más desde cualquier dispositivo y descargar contenido por 1 año",
            }
        ]

        for (const plan of data) {
            log("empieza a ejecutar paramount")
            await prisma.plan.update({
                where: {
                    id: plan.id,
                },
                data: {
                    price: plan.price,
                },
            });
        }
    }
    catch (e) {
        await browser.close()
        console.error(e)
    }

}

export default paramount;