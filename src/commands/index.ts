import { Collection } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { Command } from '../types';
import { purgeCommand } from './purge';
import { logger } from '../utils/logger';

// Array of all commands
const commands = [purgeCommand];

// Register slash commands with Discord
export async function registerCommands(clientId: string, guildIds: string[]) {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
    const commandsData = commands.map(command => command.data.toJSON());

    logger.info('Started refreshing application (/) commands.');

    // Register commands for each guild
    for (const guildId of guildIds) {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandsData }
      );
    }

    logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error('Error registering commands:', error);
  }
}

// Create a collection of commands for the client
export function getCommandsCollection() {
  const collection = new Collection<string, Command>();
  commands.forEach(command => {
    collection.set(command.data.name, command);
  });
  return collection;
}
