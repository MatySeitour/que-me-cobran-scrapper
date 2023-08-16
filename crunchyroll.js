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
        await page.goto("https://www.impuestito.com.ar/servicios");
        await sleep(2000);
        const element = await page.waitForSelector("#__next > main > section > div.jsx-2955914765.services > div:nth-child(8)");
        await element.click()
        await page.waitForSelector("main > section > div.jsx-2955914765.services > div.ServiceCardstyles__Card-sc-8hdb9n-0.lnJacE > div.ServiceCardstyles__OptionGroup-sc-8hdb9n-3.iDrYJg.tiers > div:nth-child(1) > label > span:nth-child(2)");
        const result = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                arr.push(price.innerText);
            }
            return arr;
        }, "main > section > div.jsx-2955914765.services > div.ServiceCardstyles__Card-sc-8hdb9n-0.lnJacE > div.ServiceCardstyles__OptionGroup-sc-8hdb9n-3.iDrYJg.tiers > div:nth-child(1) > label > span:nth-child(2)");

        await page.waitForSelector("#__next > main > section > div.jsx-2955914765.services > div.ServiceCardstyles__Card-sc-8hdb9n-0.lnJacE > div.ServiceCardstyles__OptionGroup-sc-8hdb9n-3.iDrYJg.tiers > div:nth-child(2) > label > span:nth-child(2)");
        const result2 = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                arr.push(price.innerText);
            }
            return arr;
        }, "#__next > main > section > div.jsx-2955914765.services > div.ServiceCardstyles__Card-sc-8hdb9n-0.lnJacE > div.ServiceCardstyles__OptionGroup-sc-8hdb9n-3.iDrYJg.tiers > div:nth-child(2) > label > span:nth-child(2)");

        await browser.close();

        let data = [
            {
                name: "Fan/1 mes",
                price: (Number(result.join("").split(" ")[0].split("$")[1].split(/\s+/)[1].replace(/[,]/g, ".")) / 1.75),
                id: 73,
                benefits: "Acceso ilimitado a animes dentro del catálogo de Crunchyroll sin publicidad.Nuevos episodios poco después de su transmisión en Japón.Disponible en 1 dispositivo al mismo tiempo.",
            },
            {
                name: "Mega-Fan/1 mes",
                price: (Number(result2.join("").split(" ")[0].split("$")[1].split(/\s+/)[1].replace(/[,]/g, ".")) / 1.75),
                id: 74,
                benefits: "Todos los beneficios del plan anterior.Disponible en 4 dispositivos al mismo tiempo.Visionado Sin Conexión.",
            },
            {
                name: "Mega-Fan/12 meses",
                price: 3799,
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

export default crunchyroll;