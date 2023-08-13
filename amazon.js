import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const amazon = async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],

    });
    const page = await browser.newPage();
    await page.goto("https://selectra.com.ar/streaming/amazon-prime-video");
    await page.waitForSelector(
        "#content-with-summary > div:nth-child(1) > p:nth-child(10) > strong"
    );
    const result = await page.evaluate((prices) => {
        let arr = [];
        const textAmazon = document.querySelector(prices)?.innerHTML;
        arr.push(textAmazon);
        return arr;
    }, "#content-with-summary > div:nth-child(1) > p:nth-child(10) > strong");

    browser.close();

    const getMonthPrice = Number(
        Array(Array(result).join("").split("$")[1]).join("").split("mensuales")[0]
    );
    const getYearPrice = getMonthPrice * 12;
    const plans = [
        {
            name: "1 mes",
            price: getMonthPrice,
        },
        {
            name: "1 año",
            price: getYearPrice,
        },
    ];
    const data = plans.map((item) => {
        let plan = {
            name: "",
            price: 0,
            benefits: "",
            id: 0,
        };
        plan.name = item.name;
        plan.price = item.price;
        if (plan.name === "1 mes") {
            plan.benefits =
                "Puedes ver en cualquier dispositivo.Puedes descargar el contenido de Amazon Prime Video.";
            plan.id = 7;
        } else if (plan.name === "1 año") {
            plan.benefits =
                "Puedes disfrutar todos los beneficios anteriores por 1 año.";
            plan.id = 8;
        }
        return plan;
    });

    for (const plan of data) {
        console.log("empieza a ejecutar netflix")
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

export default amazon;