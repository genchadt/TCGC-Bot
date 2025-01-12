import { Message, PermissionsBitField } from "discord.js";
import { Command } from "../types";
import { purgeMessages } from "../services/purge.service";
import { logger } from "../utils/logger";

const PurgeCommand: Command = {
    name: "purge",
    description: "Purges messages based on configured criteria. Usage: !purge",
    execute: async (message: Message, args: string[]) => {
        if (args.length > 0) {
            logger.info(`Purge command received arguments: ${args.join(", ")}`);
        }

        if (!message.member || !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await message.reply("You don't have permission to use this command.");
            return;
        }

        if (!message.guild) {
            await message.reply("This command is only available in servers.");
            return;
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
