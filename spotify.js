import puppeteer from "puppeteer";
import log from "./utils/log.js";
import { PrismaClient } from "@prisma/client";
import discordMessage from "./utils/discord_message.js";
import sleep from "./utils/sleep.js";
import onlyHtml from "./utils/only_html.js";

const prisma = new PrismaClient();

const spotify = async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        await onlyHtml(page)
        await page.goto("https://www.spotify.com/ar/premium/?utm_source=ar-en_brand_contextual_text&utm_medium=paidsearch&utm_campaign=alwayson_latam_ar_premiumbusiness_core_brand+contextual-desktop+text+broad+ar-en+google&gad=1&gclid=CjwKCAjw_uGmBhBREiwAeOfsdyvpaI79rTdGCXvLQtAbTrYLxkQwf0DrjD-BdlgLhaEO5OPmrtX3IBoCAUsQAvD_BwE&gclsrc=aw.ds");
        await sleep(2000);
        await page.waitForSelector("#plans > article > div > div > div > p");
        const result = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                arr.push(price.innerText);
            }
            return arr;
        }, "#plans > article > div > div > div > p");

        await browser.close()


        const getPrices = result.filter((item) => {
            return item.includes("$")
        })


        const pricesBeforeOrder = getPrices.map((price) => {
            return Number(price.split("*")[0].split("$")[1].split(" ").join("").replace(".", ""))
        })

        const pricesSpotify = pricesBeforeOrder.sort(function (a, b) { return a - b });

        console.log(pricesSpotify);


        const data = pricesSpotify.map((price, index) => {
            let plan = {
                name: "",
                price: 0,
                benefits: "",
                id: 0,
            };
            if (index === 1) {
                plan.name = "Individual",
                    plan.price = price
                plan.benefits = "Música sin anuncios para 1 cuenta.Escuchá tus canciones en cualquier lugar, incluso sin conexión.Reproducción on-demand."
                plan.id = 76
                return plan;
            }
            if (index === 2) {
                plan.name = "Duo",
                    plan.price = price,
                    plan.benefits = "Todos los beneficios del plan anterior.Disponible en 2 cuentas.Reproducción de música en modo offline."
                plan.id = 77
                return plan;
            }
            if (index === 3) {
                plan.name = "Familiar",
                    plan.price = price,
                    plan.benefits = "Todos los beneficios del plan anterior.Disponible en 6 cuentas.Bloqueo de música con contenido explícito.Spotify Kids: una aplicación independiente creada solo para niños."
                plan.id = 78
                return plan;
            }
            if (index === 0) {
                plan.name = "Estudiantes",
                    plan.price = price,
                    plan.benefits = "Descuento especial para estudiantes universitarios que cumplan con los requisitos.Todos los beneficios del plan individual."
                plan.id = 79
                return plan;
            }
        })

        for (const plan of data) {
            log("empieza a ejecutar spotify")
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
        await discordMessage("Spotify", e)
        await browser.close()
        console.error(e)
    }
}

spotify();
export default spotify;