import cron from "node-cron"
import netflix from "./netflix.js"
import hbo from "./hbo.js"
import amazon from "./amazon.js"
import disney from "./disney.js"


cron.schedule("* * * * *", async () => {
    try {
        console.log("inició")
        await netflix();
        console.log("netflix terminó")
        await hbo();
        console.log("hbo terminó")
        console.log("termino")
    }
    catch (e) {
        console.error(e)
    }
    // await amazon();
    // await disney();
})