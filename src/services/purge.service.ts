// src/services/purge.service.ts
import { Guild, TextChannel, Message } from "discord.js";
import { purgeConfig } from "../config/purge.config";
import { isWithinMessageAge } from "../utils/discord.utils";
import { logger } from "../utils/logger";

export const purgeMessages = async (guild: Guild): Promise<void> => {
    for (const rule of purgeConfig.rules) {
        for (const channelId of rule.channelIds) {
            const channel = guild.channels.cache.get(channelId) as TextChannel;
            if (!channel) {
                logger.warn(`Channel with ID ${channelId} not found.`);
                continue;
            }

            try {
                const messages = await channel.messages.fetch({ limit: 100 }); // Fetch in batches
                const messagesToDelete = messages.filter((message: Message) => {
                    return filterMessages(message, rule);
                });

                if (messagesToDelete.size > 0) {
                    await channel.bulkDelete(messagesToDelete);
                    logger.info(
                        `Deleted ${messagesToDelete.size} messages from ${channel.name}`,
                    );
                }
            } catch (error) {
                logger.error(`Error purging messages in ${channel.name}:`, error);
            }
        }
    }
};

const filterMessages = (message: Message, rule: any): boolean => {
    const includeUser = rule.includeUserGroups.length === 0 ||
        message.member.roles.cache.some((role) =>
            rule.includeUserGroups.includes(role.id)
        );
    const excludeUser = rule.excludeUserGroups.length > 0 &&
        message.member.roles.cache.some((role) =>
            rule.excludeUserGroups.includes(role.id)
        );
    const isPinned = rule.pinned === false && message.pinned;

    return (
        includeUser &&
        !excludeUser &&
        !isPinned &&
        isWithinMessageAge(message, rule.messageAge)
    );
};

export const startPurgeTimers = (client: any): void => {
    for (const rule of purgeConfig.rules) {
        const interval = rule.checkInterval || purgeConfig.defaultCheckInterval;
        setInterval(() => {
            for (const guildId of client.guilds.cache.keys()) {
                const guild = client.guilds.cache.get(guildId);
                purgeMessages(guild);
            }
        }, interval * 1000); // Convert seconds to milliseconds
    }
};