// src/services/purge.service.ts
import { Guild, TextChannel, Message } from "discord.js";
import { purgeConfig } from "../config/purge.config";
import { isWithinMessageAge } from "../utils/discord";
import { logger } from "../utils/logger";

/**
 * Purges messages based on configured criteria.
 * 
 * @param guild - The Discord guild to purge messages from.
 * @returns {number} The number of messages deleted.
 */
export const purgeMessages = async (guild: Guild): Promise<number> => {
    let totalDeleted = 0;

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
                    const deletedMessages = await channel.bulkDelete(messagesToDelete);
                    const deletedCount = deletedMessages.size;
                    totalDeleted += deletedCount;
                    logger.info(
                        `Deleted ${deletedCount} messages from ${channel.name}`,
                    );

                    if (deletedCount === 0) {
                        logger.warn("No messages were deleted.");
                    } else if (deletedCount === 1) {
                        logger.info("One message was deleted.");
                    }
                }
            } catch (error) {
                logger.error(`Error purging messages in ${channel.name}:`, error);
            }
        }
    }

    return totalDeleted;
};

/**
 * Filters messages based on the configured criteria.
 * 
 * @param message - The Discord message to check.
 * @param rule - The rule to apply.
 * @returns {boolean} True if the message should be deleted, false otherwise.
 */
const filterMessages = (message: Message, rule: any): boolean => {
    if (!message.member) return false; // Skip messages from users not in the guild

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

/**
 * Starts the message purge timers based on the configured rules.
 * 
 * @param client - The Discord client instance.
 */
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
