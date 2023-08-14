import cron from "node-cron"
import netflix from "./netflix.js"
import hbo from "./hbo.js"
import amazon from "./amazon.js"
import disney from "./disney.js"
import paramount from "./paramount.js"
import star from "./star.js"
import crunchyroll from "./crunchyroll.js"
import spotify from "./spotify.js"
import time from "./time.js"

cron.schedule("0 1 * * *", async () => {
    try {
        console.log("inició netflix")
        await netflix();
        console.log("netflix terminó", process.env.TZ)
    }
    catch (e) {
        console.error(e)
    }
})

cron.schedule("0 2 * * *", async () => {
    try {
        console.log("inició hbo")
        await hbo();
        console.log("hbo terminó")
    }
    catch (e) {
        console.error(e)
    }
})
cron.schedule("0 3 * * *", async () => {
    try {
        console.log("inició amazon")
        await amazon();
        console.log("amazon terminó", process.env.TZ)
    }
    catch (e) {
        console.error(e)
    }
})
cron.schedule("0 4 * * *", async () => {
    try {
        console.log("inició disney")
        await disney();
        console.log("disney terminó", process.env.TZ)
    }
    catch (e) {
        console.error(e)
    }
})
cron.schedule("0 5 * * *", async () => {
    try {
        console.log("inició paramount")
        await paramount();
        console.log("paramount terminó", process.env.TZ)
    }
    catch (e) {
        console.error(e)
    }
})
cron.schedule("0 6 * * *", async () => {
    try {
        console.log("inició star")
        await star();
        console.log("star terminó", process.env.TZ)
    }
    catch (e) {
        console.error(e)
    }
})
cron.schedule("0 7 * * *", async () => {
    try {
        console.log("inició crunchyroll")
        await crunchyroll();
        console.log("crunchyroll terminó", process.env.TZ)
    }
    catch (e) {
        console.error(e)
    }
})

cron.schedule("0 23 * * *", async () => {
    try {
        console.log("inició spotify")
        await spotify();
        console.log("spotify terminó", process.env.TZ)
    }
    catch (e) {
        console.error(e)
    }
})
