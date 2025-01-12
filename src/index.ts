// src/index.ts
import { Client, IntentsBitField } from "discord.js";
import { connectToDatabase } from "./services/database.service";
import { logger } from "./utils/logger";
import botConfig from "./config/bot.config";
import registerCommands from "./utils/commandLoader";
import registerEvents from "./utils/eventLoader";
import { startPurgeTimers } from "./services/purge.service";

/**
 * Creates a new Discord bot client.
 */
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

/**
 * Starts the bot and sets up all necessary services.
 */
const startBot = async (): Promise<void> => {
    try {
        await connectToDatabase();

        registerCommands(client);
        registerEvents(client);

        startPurgeTimers(client);

        await client.login(botConfig.token);
        logger.info("Bot is ready!");
    } catch (error) {
        logger.error("Error starting bot:", error);
        process.exit(1); // Exit with a failure code
    }
};

startBot();

/**
 * Shut down the bot cleanly.
 */
const shutdownBot = async () => {
    try {
        logger.info("Shutting down bot...");
        await client.destroy();
        process.exit(0);
    } catch (error) {
        logger.error("Error during shutdown:", error);
        process.exit(1);
    }
};

process.on("SIGINT", shutdownBot);
process.on("SIGTERM", shutdownBot);
