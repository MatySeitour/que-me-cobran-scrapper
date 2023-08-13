import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import log from "./utils/log.js";

const prisma = new PrismaClient();

const crunchyroll = async () => {
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
        await page.goto("https://www.crunchyroll.com/es/welcome");
        await page.waitForSelector("h4");
        const result = await page.evaluate((prices) => {
            let arr = [];
            const pricesNetflix = document.querySelectorAll(prices);
            for (const price of pricesNetflix) {
                arr.push(price.innerText);
            }
            return arr;
        }, "h4");

        await browser.close();

        const data = result.map((item, index) => {
            let plan = {
                name: "",
                price: 0,
                benefits: "",
                id: 0,
            };
            if (index === 0) {
                plan.name = "Fan/1 mes";
                plan.price = Number(Array(item).join("").split("ARS")[0].replace(/[,]/g, "").split("00")[0]);
                plan.benefits = "Acceso ilimitado a animes dentro del catálogo de Crunchyroll sin publicidad.Nuevos episodios poco después de su transmisión en Japón.Disponible en 1 dispositivo al mismo tiempo."
                plan.id = 73
                return plan;
            }
            if (index === 1) {
                plan.name = "Mega-Fan/1 mes";
                plan.price = Number(Array(item).join("").split("ARS")[0].replace(/[,]/g, "").split("00")[0]);
                plan.benefits = "Todos los beneficios del plan anterior.Disponible en 4 dispositivos al mismo tiempo.Visionado Sin Conexión."
                plan.id = 74
                return plan;
            }
            if (index === 2) {
                plan.name = "Mega-Fan/12 meses";
                plan.price = Number(Array(item).join("").split("ARS")[0].replace(/[,]/g, "").split("00")[0]);
                plan.benefits = "Todos los beneficios del plan anterior.16 % de descuento sobre el Plan Mensual (cargo cada 12 meses)."
                plan.id = 75
                return plan;
            }
        });

        for (const plan of data) {
            log("empieza a ejecutar crunchyroll")
            await prisma.plan.update({
                where: {
                    id: plan.id,
                },
                data: {
                    price: plan.price,
                },
            });
        }
        console.log(data);
    }
    catch (e) {
        await browser.close()
        console.error(e)
    }

    //   browser.close();
};

export default crunchyroll;
