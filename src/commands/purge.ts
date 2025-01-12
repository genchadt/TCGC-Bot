import { Message } from "discord.js";
import { Command } from "../types";
import { purgeMessages } from "../services/purge.service";
import { logger } from "../utils/logger";

const PurgeCommand: Command = {
    name: "purge",
    description: "Purges messages based on configured criteria.",
    execute: async (message: Message, args: string[]) => {
        try {
            await purgeMessages(message.guild);
            await message.reply("Messages purged successfully!");
        } catch (error) {
            logger.error("Error during purge:", error);
            await message.reply("An error occurred while purging messages.");
        }
    },
};

export default PurgeCommand;
