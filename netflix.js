import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import log from "./utils/log.js";

const prisma = new PrismaClient();

const netflix = async () => {
    try {
        log("antes de abrir el navegador")
        const browser = await puppeteer.launch({
            headless: "new",
            // executablePath: '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        log("browser")
        const page = await browser.newPage();
        await page.goto("https://help.netflix.com/es/node/24926/ar");
        log("va a la pagina")
        await page.waitForSelector(
            "body > div > div > div > div > div > section > div > div > div:nth-child(3) > ul > li > p"
        );
        const result = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                arr.push(Array(price.innerText).join("").split("al")[0]);
            }
            return arr;
        }, "body > div > div > div > div > div > section > div > div > div:nth-child(3) > ul > li > p");

        browser.close();

        log("cierra el navegador")

        const data = result.map((item) => {
            let plan = {
                name: "",
                price: 0,
                benefits: "",
                id: 0,
            };
            let b = item.split(/\s+/).join("");
            let c = Array(b).join("").split("ARS");
            let d = c[0].substring(0, c[0].length - 1);
            plan.name = d;
            plan.price = Number(c[1]);

            if (d === "Básico") {
                plan.id = 1;
                plan.benefits =
                    "Puedes ver contenido en 1 dispositivo compatible a la vez.Puedes ver en HD.Puedes descargar contenido en 1 dispositivo compatible a la vez.";
            } else if (d === "Estándar") {
                plan.id = 2;
                plan.benefits =
                    "Puedes ver contenido en 2 dispositivos compatibles a la vez.Puedes ver en Full HD.Puedes descargar contenido en 2 dispositivos compatibles a la vez.Opción para agregar hasta 1 miembro extra que no viva contigo.";
            } else if (d === "Premium") {
                plan.id = 3;
                plan.benefits =
                    "Puedes ver contenido en 4 dispositivos compatibles a la vez.Puedes ver en Ultra HD.Puedes descargar contenido en 6 dispositivos compatibles a la vez.Opción para agregar hasta 2 miembros extras que no vivan contigo.";
            }
            return plan;
        });

        log("antes de ejecutar prisma")

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
        console.error(e)
    }

}

export default netflix;