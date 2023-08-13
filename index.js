import cron from "node-cron"
import netflix from "./netflix.js"
import hbo from "./hbo.js"
import amazon from "./amazon.js"
import disney from "./disney.js"


cron.schedule("0 * * * *", async () => {
    try {
        console.log("inició")
        await netflix();
        console.log("netflix terminó")
    }
    catch (e) {
        console.error(e)
    }
})

cron.schedule("15 * * * *", async () => {
    try {
        await hbo();
        console.log("hbo terminó")
    }
    catch (e) {
        console.error(e)
    }
})

// cron.schedule("30 * * * *", async () => {
//     try {
//         await amazon();
//         console.log("amazon terminó")
//     }
//     catch (e) {
//         console.error(e)
//     }
// })

// cron.schedule("45 * * * *", async () => {
//     try {
//         await disney();
//         console.log("disney terminó")
//     }
//     catch (e) {
//         console.error(e)
//     }
// })