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
        await page.goto("https://www.starplus.com/es-ar?cid=DSS-Search-Google-71700000085791494-&s_kwcid=AL!8468!3!576717262205!b!!g!!precio%20star%20plus&gad=1&gclid=CjwKCAjw_uGmBhBREiwAeOfsd4ttE9qqO-pwigXBDAgAEuC6iUPCqaNRU_qbCJ3BRZADBeF5dW-s2BoCuVgQAvD_BwE&gclsrc=aw.ds");
        await sleep(2000);
        await page.waitForSelector("h3");
        const result = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                if (price) {
                    arr.push(price.innerText);
                }
            }
            return arr;
        }, "h3");

        await browser.close()

        const getPrices = result.filter((price, index) => {
            if (index === 1 || index === 2 || index === 3) {
                return price;
            }
        })

        const data = getPrices.map((item, index) => {
            if (index == 0) {
                return {
                    name: "Star+/1 mes",
                    id: 70,
                    price: (Number(Array(item).join("").split("ARS")[1].split("/")[0].split(/\s+/)[1].replaceAll('.', '')) / 1.74).toFixed(0),
                    benefits: "Puedes acceder a estrenos de películas, series y eventos deportivos de ESPN en cualquier dispositivo por 1 mes.",
                };
            } else if (index == 1) {
                return {
                    name: "Star+ y Disney+/1 mes",
                    id: 71,
                    price: (Number(Array(item).join("").split("ARS")[1].split("/")[0].split(/\s+/)[1].replaceAll('.', '')) / 1.74).toFixed(0),
                    benefits:
                        "Puedes acceder a contenido de Disney+ y Star+ por 1 mes.",
                };
            } else {
                return {
                    name: "Star+/12 meses",
                    id: 72,
                    price: (Number(Array(item).join("").split("ARS")[1].split("/")[0].split(/\s+/)[1].replaceAll('.', '')) / 1.74).toFixed(0),
                    benefits:
                        "Puedes acceder a estrenos de películas, series y eventos deportivos de ESPN en cualquier dispositivo por 12 meses.",
                };
            }
        })

        for (const plan of data) {
            log("empieza a ejecutar star")
            await prisma.plan.update({
                where: {
                    id: plan.id,
                },
                data: {
                    price: Number(plan.price),
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