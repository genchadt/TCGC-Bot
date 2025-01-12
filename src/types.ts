// src/types.ts
import { Message, Collection } from "discord.js";

/**
 * Represents a command that can be executed by the bot.
 */
export interface Command {
    /** 
     * The name of the command.
     */
    name: string;
    
    /**
     * A brief description of what the command does.
     */
    description: string;

    /**
     * The function that is called when the command is executed.
     * 
     * @param message - The message that triggered the command.
     * @param args - The arguments passed to the command.
     */
    execute: (message: Message, args: string[]) => Promise<void>;
}

/**
 * Configuration for the purge service.
 */
export interface PurgeConfig {
    /**
     * The default check interval (in milliseconds) for purging messages.
     */
    defaultCheckInterval: number;

    /**
     * A list of rules defining which messages to purge.
     */
    rules: PurgeRule[];
}

/**
 * A rule defining which messages to purge.
 */
export interface PurgeRule {
    /**
     * The channel IDs from which to purge messages.
     */
    channelIds: string[];

    /**
     * The user IDs to include in the purge.
     */
    includeUserGroups: string[];

    /**
     * The user IDs to exclude from the purge.
     */
    excludeUserGroups: string[];

    /**
     * Whether to include pinned messages in the purge.
     */
    pinned: boolean;

    /**
     * The maximum age (in seconds) of messages to keep.
     */
    messageAge: number;

    /**
     * The interval (in seconds) at which to check for messages to purge.
     * If not specified, the default check interval will be used.
     */
    checkInterval?: number;
}

/**
 * Extends the Discord.js Client class to include a collection of commands.
 */
declare module "discord.js" {
    /**
     * The Client interface with an added collection of commands.
     */
    interface Client {
        /**
         * A collection of commands that the client knows about.
         */
        commands: Collection<string, Command>;
    }
}
