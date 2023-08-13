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
        await page.goto("https://www.hbomax.com/ar/es");
        await page.waitForSelector(".plan-price");
        const result = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                arr.push(Array(price.innerText));
            }

            return arr.filter(
                (item, index) => index === 3 || index === 4 || index === 5
            );
        }, ".plan-price");

        await browser.close()
        const data = result.map((item, index) => {
            if (index == 0) {
                return {
                    name: "1 mes",
                    id: 48,
                    price: Array(item)
                        .join("")
                        .split("$")[1]
                        .split(/\s+/)
                        .join("")
                        .replace(",", ".")
                        .split(".00")
                        .join(""),
                    benefits:
                        "Puedes ver en 3 dispositivos a la vez.Hasta 5 perfiles para toda la familia.",
                };
            } else if (index == 1) {
                return {
                    name: "3 mes",
                    id: 49,
                    price: Array(item)
                        .join("")
                        .split("$")[1]
                        .split(/\s+/)
                        .join("")
                        .replace(",", ".")
                        .split(".00")
                        .join("")
                        .split(".")
                        .join(""),
                    benefits:
                        "Disfruta en todas tus pantallas.Contenido en alta definición y 4K.",
                };
            } else {
                return {
                    name: "12 meses",
                    id: 50,
                    price: Array(item)
                        .join("")
                        .split("$")[1]
                        .split(/\s+/)
                        .join("")
                        .replace(",", ".")
                        .split(".00")
                        .join("")
                        .split(".")
                        .join(""),
                    benefits:
                        "Chromecast y Airplay disponibles.Descarga y disfruta donde sea.Ahorra 3 meses.",
                };
            }
        });

        log("antes de actualizar los datos de hbo en la db ")

        for (const plan of data) {
            console.log("empieza a ejecutar el prisma hbo")
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
        await discordMessage("HBO", e)
        console.error(e);
        await browser.close();
    }

}

export default hbo;