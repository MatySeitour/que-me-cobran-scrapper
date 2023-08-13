import puppeteer from "puppeteer";

const disney = async () => {
    const browser = await puppeteer.launch({
        headless: false,
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

    const disneyPlans = disneyPrices.map((item, index) => {
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
    console.log(disneyPlans);
    return disneyPlans;
}


export default disney;

// Unhandled Promise Rejection {"error Type":"Runtime.UnhandledPromiseRejection","error Message":"PrismaClientInitializationError: \Invalid `prisma.plan.update()` invocation:\n\n\nTimed out fetching a new connection from the connection pool. More info: http://pris.ly/d/connection-pool (Current connection pool timeout: 10, connection limit: 5)","reason":{"errorType":"PrismaClientInitializationError","errorMessage":"\nInvalid `prisma.plan.update()` invocation:\n\n\nTimed out fetching a new connection from the connection pool. More info: http://pris.ly/d/connection-pool (Current connection pool timeout: 10, connection limit: 5)","name":"PrismaClientInitializationError","clientVersion":"5.1.1","stack":["PrismaClientInitializationError: ","Invalid `prisma.plan.update()` invocation:","","","Timed out fetching a new connection from the connection pool. More info: http://pris.ly/d/connection-pool (Current connection pool timeout: 10, connection limit: 5)"," at Hr.handleRequestError (/var/task/node_modules/@prisma/client/runtime/library.js:122:7272)"," at Hr.handleAndLogRequestError (/var/task/node_modules/@prisma/client/runtime/library.js:122:6388)"," at Hr.request (/var/task/node_modules/@prisma/client/runtime/library.js:122:6108)"," at async l (/var/task/node_modules/@prisma/client/runtime/library.js:126:10298)"," at async /var/task/.next/server/pages/api/cron/netflix.js:79:9"]},"promise":{},"stack":["Runtime.UnhandledPromiseRejection: PrismaClientInitializationError: ","Invalid `prisma.plan.update()` invocation:","","","Timed out fetching a new connection from the connection pool. More info: http://pris.ly/d/connection-pool (Current connection pool timeout: 10, connection limit: 5)"," at process.<anonymous> (file:///var/runtime/index.mjs:1186:17)"," at process.emit (node:events:525:35)"," at emit (node:internal/process/promises:149:20)"," at processPromiseRejections (node:internal/process/promises:283:27)"," at process.processTicksAndRejections (node:internal/process/task_queues:96:32)"]} Unknown application error occurr