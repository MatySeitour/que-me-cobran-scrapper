import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const disney = async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto("https://www.disneyplus.com/es-ar?cid=DSS-Search-Google-71700000075032759-&s_kwcid=AL!8468!3!631491014848!p!!g!!disney%20plus&gad=1&gclid=CjwKCAjw29ymBhAKEiwAHJbJ8lPo0suBn2G6T4_c4YjpWd02NMcI4ub2E1uXJx61ciwd_r5ns2ErYBoCwvkQAvD_BwE&gclsrc=aw.ds");
    await page.waitForSelector(".chart-grid span");
    const result = await page.evaluate((prices) => {
        let arr = [];
        const pricesNetflix = document.querySelectorAll(prices);
        for (const price of pricesNetflix) {
            if (price) {
                arr.push(price.innerText);
            }
        }
        return arr;
    }, ".chart-grid span");

    browser.close();

    const prevDisneyPrices = result.filter(price => price.includes("ARS"))
    const disneyPrices = prevDisneyPrices.map((pricePlan) => {
        return Number(pricePlan.split("ARS")[1].split("/")[0].split(" ")[1].replace(/[.]/g, ''))
    })

    const data = disneyPrices.map((item, index) => {
        let plan = {
            name: "",
            price: "",
            benefits: "",
        }
        if (index === 0) {
            plan = {
                name: "1 mes",
                price: Number((item / 1.74).toFixed(0)),
                benefits: "Acceso a estrenos de películas, series originales y los clásicos atemporales de Disney, Pixar, Marvel, Star Wars y National Geographic. Puedes descargar el contenido que quieras. Acceso desde cualquier dispositivo."
            }
            return plan;
        }
        if (index === 1) {
            plan = {
                name: "Combo Disney+ y Star+ 1 mes",
                price: Number((item / 1.74).toFixed(0)),
                benefits: "Puedes disfrutar de todos los beneficios anteriores y acceder a contenido de Star+."
            }
            return plan;
        }
        if (index === 2) {
            plan = {
                name: "12 meses",
                price: Number((item / 1.74).toFixed(0)),
                benefits: "Puedes disfrutar de todos los beneficios anteriores por un periodo de 12 meses. Ahorras 3 meses!"
            }
            return plan;
        }
    })
    for (const plan of data) {
        console.log("empieza a ejecutar disney")
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


export default disney;
