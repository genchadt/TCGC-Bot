// src/types.ts
import { Message, Collection } from "discord.js";

export interface Command {
    name: string;
    description: string;
    execute: (message: Message, args: string[]) => Promise<void>;
}

export interface PurgeConfig {
    defaultCheckInterval: number;
    rules: PurgeRule[];
}

export interface PurgeRule {
    channelIds: string[];
    includeUserGroups: string[];
    excludeUserGroups: string[];
    pinned: boolean;
    messageAge: number;
    checkInterval?: number;
}

// Extend the Client interface to include commands
declare module "discord.js" {
    interface Client {
        commands: Collection<string, Command>;
    }
}
