import puppeteer from "puppeteer";
import log from "./utils/log.js";
import { PrismaClient } from "@prisma/client";
import discordMessage from "./utils/discord_message.js";
import sleep from "./utils/sleep.js";
import onlyHtml from "./utils/only_html.js";

const prisma = new PrismaClient();

const crunchyroll = async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await onlyHtml(page)
        await page.goto("https://www.crunchyroll.com/es/welcome");
        await sleep(2000);
        await page.waitForSelector("h4[data-t]");
        const result = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                arr.push(price.innerText);
            }
            return arr;
        }, "h4[data-t]");

        await browser.close();


        const planFan = result[0].split(",")[0];
        const planMegaFanMonth = result[1].split(",")[0];
        const planMegaFanYear = result[2].split(",")[0];

        let data = [
            {
                name: "Fan/1 mes",
                price: Number(planFan),
                id: 73,
                benefits: "Acceso ilimitado a animes dentro del catálogo de Crunchyroll sin publicidad.Nuevos episodios poco después de su transmisión en Japón.Disponible en 1 dispositivo al mismo tiempo.",
            },
            {
                name: "Mega-Fan/1 mes",
                price: Number(planMegaFanMonth),
                id: 74,
                benefits: "Todos los beneficios del plan anterior.Disponible en 4 dispositivos al mismo tiempo.Visionado Sin Conexión.",
            },
            {
                name: "Mega-Fan/12 meses",
                price: Number(planMegaFanYear),
                id: 75,
                benefits: "Todos los beneficios del plan anterior.16 % de descuento sobre el Plan Mensual (cargo cada 12 meses).",
            },
        ]

        for (const plan of data) {
            log("empieza a ejecutar crunchyroll")
            await prisma.plan.update({
                where: {
                    id: plan.id,
                },
                data: {
                    price: Number(plan.price),
                },
            });
        }
        console.log(data);
    }
    catch (e) {
        await discordMessage("Crunchyroll", e)
        await browser.close()
        console.error(e)
    }

};

crunchyroll();
export default crunchyroll;