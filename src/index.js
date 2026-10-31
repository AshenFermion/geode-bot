import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import "dotenv/config";

import { loadCommands } from "./handlers/commandHandler.js"
import { loadInteractions } from "./handlers/interactionHandler.js";
import { loadEvents } from "./events/readyHandler.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
client.cooldowns = new Collection();

loadCommands(client);
loadInteractions(client);
loadEvents(client);

client.login(process.env.TOKEN);