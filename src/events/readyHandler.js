import { Events } from "discord.js";
import { reminderScheduler } from "../services/reminderScheduler.js";

export function loadEvents(client) {
    client.once(Events.ClientReady, (readyClient) => {
        console.log(`${readyClient.user.username} is online`);

        reminderScheduler(client);
    })
}