import axios from "axios"
import time from "../time.js";

export default async function discordMessage(serviceName, errorMessage) {
    await axios.post(process.env.DISCORD_BOT, {
        payload_json: JSON.stringify({
            embeds: [
                {
                    title: `Error ${serviceName} a las ${time()}`,
                    description: `**${errorMessage}**`,
                    color: 12725566,
                },
            ],
        }),
    });
}