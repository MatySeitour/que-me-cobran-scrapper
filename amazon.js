import puppeteer from "puppeteer";
import log from "./utils/log.js";
import { PrismaClient } from "@prisma/client";
import discordMessage from "./utils/discord_message.js";
import sleep from "./utils/sleep.js";
import onlyHtml from "./utils/only_html.js";

const prisma = new PrismaClient();

const amazon = async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],

    });
    try {
        const page = await browser.newPage();
        await onlyHtml(page)
        await page.goto("https://www.primevideo.com/offers/nonprimehomepage/ref=dvm_pds_brd_ar_hk_s_g_mkw_st1neeu6k-dc_pcrid_645960031810?mrntrk=slid__pgrid_41343053246_pgeo_1000058_x__adext__ptid_kwd-314575875558");
        await sleep(2000);
        await page.waitForSelector(
            "div > div > div > p"
        );

        const result = await page.evaluate((prices) => {
            let arr = [];
            const textAmazon = document.querySelector(prices)?.innerHTML;
            arr.push(textAmazon);
            return arr;
        }, "div > div > div > p");

        console.log(result)

        browser.close();

        const getMonthPrice = Number(
            Array(Array(result).join("").split(";")[1]).join("").split("/mes")[0]
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
                plan.id = 51;
            } else if (plan.name === "1 año") {
                plan.benefits =
                    "Puedes disfrutar todos los beneficios anteriores por 1 año.";
                plan.id = 52;
            }
            return plan;
        });

        for (const plan of data) {
            console.log("empieza a ejecutar amazon")
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
        await discordMessage("Amazon", e)
        await browser.close()
        console.error(e)
    }
}

export default amazon;