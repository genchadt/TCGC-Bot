import { 
  ChatInputCommandInteraction, 
  SlashCommandBuilder, 
  SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';

export interface ChannelConfig {
  id: string;
  name: string;
  retentionHours: number;
}

export interface GuildConfig {
  guildId: string;
  channels: ChannelConfig[];
}

export interface Config {
  purgeChannels: GuildConfig[];
}

export interface Command {
  data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> | SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface PurgeOptions {
  channelId: string;
  retentionHours: number;
  skipPinned?: boolean;
}
