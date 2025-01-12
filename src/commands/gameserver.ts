// src/commands/gameserver.ts
import { Message, PermissionsBitField } from "discord.js";
import { Command } from "../types";
import { startGameServer, stopGameServer, getGameServerStatus } from "../services/gameserver.service";
import { logger } from "../utils/logger";

const GameServerCommand: Command = {
    name: "gameserver",
    description: "Manages the game server. Usage: /gameserver name:<servername> action:<start|stop|status>",
    execute: async (message: Message, args: string[]) => {
        if (!message.member || !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await message.reply("You don't have permission to use this command.");
            return;
        }

        // Parse arguments
        const argsMap = new Map<string, string>();
        for (const arg of args) {
            const [key, value] = arg.split(":");
            if (key && value) {
                argsMap.set(key.trim().toLowerCase(), value.trim().toLowerCase());
            }
        }

        const serverName = argsMap.get("name");
        const action = argsMap.get("action");

        if (!serverName || !action) {
            await message.reply("Invalid arguments. Usage: /gameserver name:<servername> action:<start|stop|status>");
            return;
        }

        try {
            if (action === "start") {
                await startGameServer(serverName);
                await message.reply(`Game server "${serverName}" started!`);
            } else if (action === "stop") {
                await stopGameServer(serverName);
                await message.reply(`Game server "${serverName}" stopped!`);
            } else if (action === "status") {
                const status = await getGameServerStatus(serverName);
                await message.reply(status);
            } else {
                await message.reply("Invalid action. Use 'start', 'stop', or 'status'.");
            }
        } catch (error) {
            logger.error("Error managing game server:", error);
            await message.reply("An error occurred while managing the game server.");
        }
    },
};

export default GameServerCommand;
