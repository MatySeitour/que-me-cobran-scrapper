import puppeteer from "puppeteer";
import log from "./utils/log.js";
import { PrismaClient } from "@prisma/client";
import discordMessage from "./utils/discord_message.js";
import sleep from "./utils/sleep.js";
import onlyHtml from "./utils/only_html.js";

const prisma = new PrismaClient();

const netflix = async () => {
    try {
        log("antes de abrir el navegador")
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        log("browser")
        const page = await browser.newPage();
        await onlyHtml(page)
        await page.goto("https://help.netflix.com/es/node/24926/ar");
        log("va a la pagina")
        await sleep(2000);
        await page.waitForSelector(
            "body > div.global-container > div.global-content > div > div.pane-wrapper > div.left-pane > section.kb-article.kb-article-variant.gradient > div > div > div > ul > li > p"
        );
        const result = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                arr.push(Array(price.innerText).join("").split("al")[0]);
            }
            return arr;
        }, "body > div.global-container > div.global-content > div > div.pane-wrapper > div.left-pane > section.kb-article.kb-article-variant.gradient > div > div > div > ul > li > p");


        browser.close();

        log("cierra el navegador")

        const data = result.map((item, index) => {

            let name = item.split(/\s+/).join("").split(":");
            let c = Number(Array(name[1]).join("").split("ARS")[0]);

            if (index === 0) {
                let plan = {
                    id: 1,
                    name: name[0],
                    benefits: "Puedes ver contenido en 1 dispositivo compatible a la vez.Puedes ver en HD.Puedes descargar contenido en 1 dispositivo compatible a la vez.",
                    price: c
                }
                return plan;
            } else if (index === 1) {
                let plan = {
                    id: 2,
                    name: name[0],
                    benefits: "Puedes ver contenido en 2 dispositivos compatibles a la vez.Puedes ver en Full HD.Puedes descargar contenido en 2 dispositivos compatibles a la vez.Opción para agregar hasta 1 miembro extra que no viva contigo",
                    price: c
                }
                return plan;

            } else if (index === 2) {
                let plan = {
                    id: 3,
                    name: name[0],
                    benefits: "Puedes ver contenido en 4 dispositivos compatibles a la vez.Puedes ver en Ultra HD.Puedes descargar contenido en 6 dispositivos compatibles a la vez.Opción para agregar hasta 2 miembros extras que no vivan contigo.",
                    price: c
                }
                return plan;

            }
        });

        log("antes de ejecutar prisma")
        console.log(data)

        for (const plan of data) {
            log("empieza a ejecutar netflix")
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
        await discordMessage("Netflix", e)
        console.error(e)
    }

}

export default netflix;