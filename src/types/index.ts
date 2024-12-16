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

export interface MessageFilter {
  // Time-based filters
  retentionHours: number;
  
  // User-based filters
  includeUsers?: string[];      // Specific user IDs to include
  excludeUsers?: string[];      // Specific user IDs to exempt
  includeBots?: boolean;        // Whether to include bot messages
  
  // Content-based filters
  skipPinned?: boolean;         // Skip pinned messages
  includeKeywords?: string[];   // Messages containing these keywords
  excludeKeywords?: string[];   // Skip messages containing these keywords
  
  // Reaction-based filters
  minReactions?: number;        // Skip messages with at least this many reactions
  skipStarred?: boolean;       // Skip messages with ⭐ reaction
  
  // Attachment filters
  includeFiles?: boolean;      // Include messages with files
  includeImages?: boolean;     // Include messages with images
  includeEmbeds?: boolean;     // Include messages with embeds
  
  // Role-based filters
  includeRoles?: string[];     // Messages from users with these roles
  excludeRoles?: string[];     // Skip messages from users with these roles
}

export interface ChannelConfig {
  id: string;
  name: string;
  enabled: boolean;            // Whether autopurge is enabled for this channel
  filters: MessageFilter;
  schedule?: {                 // Optional scheduling
    timezone: string;          // e.g., "America/New_York"
    activeHours?: {           // Only run during these hours
      start: number;          // 0-23
      end: number;            // 0-23
    };
    checkIntervalMinutes?: number; // Override default check interval
  };
}

export interface GuildConfig {
  guildId: string;
  enabled: boolean;            // Whether autopurge is enabled for this guild
  channels: ChannelConfig[];
}

export interface Config {
  purgeChannels: GuildConfig[];
}
