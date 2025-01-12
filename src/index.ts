// src/index.ts
import { Client, IntentsBitField } from "discord.js";
import { connectToDatabase } from "./services/database.service";
import { logger } from "./utils/logger";
import botConfig from "./config/bot.config";
import registerCommands from "./utils/commandLoader";
import registerEvents from "./utils/eventLoader";
import { startPurgeTimers } from "./services/purge.service";

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

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
