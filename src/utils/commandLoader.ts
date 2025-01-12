// src/utils/commandLoader.ts
import { Client, Collection } from "discord.js";
import * as fs from "fs";
import { Command } from "../types";
import { logger } from "./logger";

export default (client: Client): void => {
    client.commands = new Collection<string, Command>();

    const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".ts"));

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`).default as Command;
        client.commands.set(command.name, command);
        logger.info(`Loaded command: ${command.name}`);
    }
};
