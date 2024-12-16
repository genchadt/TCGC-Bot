import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { registerCommands, getCommandsCollection } from './commands';
import { Command } from './types';
import { AutoPurgeService } from './services/autoPurgeService';

dotenv.config();

declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, Command>;
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});

// Initialize commands collection
client.commands = getCommandsCollection();

client.once(Events.ClientReady, async (c) => {
    logger.info(`Ready! Logged in as ${c.user.tag}`);

    // Start auto-purge service
    const autoPurgeService = AutoPurgeService.getInstance(client);
    autoPurgeService.start();

    // Register slash commands
    const guildIds = process.env.GUILD_IDS?.split(',') || [];
    if (!process.env.CLIENT_ID) {
        logger.error('CLIENT_ID not found in environment variables');
        return;
    }

    await registerCommands(process.env.CLIENT_ID, guildIds);
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
  } catch (error) {
    logger.error('Error executing command:', error);
    await interaction.reply({
      content: 'There was an error executing this command!',
      ephemeral: true,
    });
  }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
