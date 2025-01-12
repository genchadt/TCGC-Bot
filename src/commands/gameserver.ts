import { Message } from "discord.js";
import { Command } from "../types";
import { startGameServer, stopGameServer } from "../services/gameserver.service";
import { logger } from "../utils/logger";

const GameServerCommand: Command = {
    name: "gameserver",
    description: "Manages the game server.",
    execute: async (message: Message, args: string[]) => {
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            return message.reply("You don't have permission to use this command.");
        }

        const action = args[0]; // e.g., "start", "stop"

        try {
            if (action === "start") {
                await startGameServer();
                await message.reply("Game server started!");
            } else if (action === "stop") {
                await stopGameServer();
                await message.reply("Game server stopped!");
            } else {
                await message.reply("Invalid action. Use 'start' or 'stop'.");
            }
        } catch (error) {
            logger.error("Error managing game server:", error);
            await message.reply("An error occurred while managing the game server.");
        }
    },
};

export default GameServerCommand;
