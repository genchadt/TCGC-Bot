import { Message } from "discord.js";
import { Command } from "../types";
import { purgeMessages } from "../services/purge.service";
import { logger } from "../utils/logger";

const PurgeCommand: Command = {
    name: "purge",
    description: "Purges messages based on configured criteria. Usage: !purge",
    execute: async (message: Message, args: string[]) => {
        if (!message.member || !message.member.permissions.has("ADMINISTRATOR")) {
            return message.reply("You don't have permission to use this command.");
        }

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
