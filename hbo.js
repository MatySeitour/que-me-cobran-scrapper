import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hbo = async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await page.goto("https://www.hbomax.com/ar/es");
        await page.waitForSelector(".plan-price");
        const result = await page.evaluate((prices) => {
            let arr = [];
            const priceHbo = document.querySelectorAll(prices);
            for (const price of priceHbo) {
                arr.push(Array(price.innerText));
            }

            return arr.filter(
                (item, index) => index === 3 || index === 4 || index === 5
            );
        }, ".plan-price");

        await browser.close();

        const hboPlans = result.map((item, index) => {
            if (index == 0) {
                return {
                    name: "1 mes",
                    id: 48,
                    price: Number(Array(item)
                        .join("")
                        .split("$")[1]
                        .split(/\s+/)
                        .join("")
                        .replace(",", ".")
                        .split(".00")
                        .join("")),
                    benefits:
                        "Puedes ver en 3 dispositivos a la vez.Hasta 5 perfiles para toda la familia.",
                };
            } else if (index == 1) {
                return {
                    name: "3 mes",
                    id: 49,
                    price: Number(Array(item)
                        .join("")
                        .split("$")[1]
                        .split(/\s+/)
                        .join("")
                        .replace(",", ".")
                        .split(".00")
                        .join("")
                        .split(".")
                        .join("")),
                    benefits:
                        "Disfruta en todas tus pantallas.Contenido en alta definición y 4K.",
                };
            } else {
                return {
                    name: "12 meses",
                    id: 50,
                    price: Number(Array(item)
                        .join("")
                        .split("$")[1]
                        .split(/\s+/)
                        .join("")
                        .replace(",", ".")
                        .split(".00")
                        .join("")
                        .split(".")
                        .join("")),
                    benefits:
                        "Chromecast y Airplay disponibles.Descarga y disfruta donde sea.Ahorra 3 meses.",
                };
            }
        });

        for (const plan of hboPlans) {
            console.log("empieza a ejecutar hbo")
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
        console.error(e);
        await browser.close();
    }

}

export default hbo;