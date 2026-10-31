import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { fileURLToPath, pathToFileURL } from "node:url";
import { REST, Routes } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

const foldersPath = path.join(__dirname, './commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const commandModule = await import(pathToFileURL(filePath).href);
        const command = commandModule.default;

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`!!! The command at ${filePath} is missing "data" or "execute"`);
        }
    }
}


const rest = new REST().setToken(process.env.TOKEN);

try {
    console.log(`Refreshed ${commands.length} commands.`);

    const data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID), { body: commands}
    );
} catch (error) {
    console.error(error);
}