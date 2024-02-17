import puppeteer from "puppeteer";
import log from "./utils/log.js";
import { PrismaClient } from "@prisma/client";
import discordMessage from "./utils/discord_message.js";
import sleep from "./utils/sleep.js";
import onlyHtml from "./utils/only_html.js";

const prisma = new PrismaClient();

// new url: https://selectra.com.ar/streaming/paramount-plus

const hbo = async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await onlyHtml(page);
        await page.goto("https://www.hbomax.com/ar/es");
        await page.waitForSelector("div > h3");
        const result = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            console.log(pricesNetflix);
            for (const price of pricesNetflix) {
                arr.push(price.innerHTML);
            }
            return arr;
        }, "div > h3");


        await browser.close()

        const priceMonth = Number(result[0].split(",")[0].replace(".", "").split("$")[1])
        const priceYear = Number(result[1].split(",")[0].replace(".", "").split("$")[1])

        const data = [{
            name: "1 mes",
            id: 48,
            price: priceMonth,
            benefits:
                "Puedes ver en 3 dispositivos a la vez.Hasta 5 perfiles para toda la familia.",
        },
        {
            name: "3 meses",
            id: 49,
            price: priceMonth * 3,
            benefits:
                "Disfruta en todas tus pantallas.Contenido en alta definición y 4K.",
        },
        {
            name: "1 año",
            id: 50,
            price: priceYear,
            benefits:
                "Chromecast y Airplay disponibles.Descarga y disfruta donde sea.Ahorra 3 meses.",
        }
        ]

        log("antes de actualizar los datos de hbo en la db ")

        for (const plan of data) {
            console.log("empieza a ejecutar el prisma hbo")
            await prisma.plan.update({
                where: {
                    id: plan.id,
                },
                data: {
                    price: plan.price,
                },
            });
        }

        console.log(data)
    }
    catch (e) {
        await discordMessage("HBO", e)
        console.error(e);
        await browser.close();
    }

}

export default hbo;
