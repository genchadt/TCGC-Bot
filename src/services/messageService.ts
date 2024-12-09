import { TextChannel } from 'discord.js';
import { logger } from '../utils/logger';
import { PurgeOptions } from '../types';

export class MessageService {
  private static instance: MessageService;

  private constructor() {}

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  public async purgeMessages(channel: TextChannel, options: PurgeOptions): Promise<number> {
    try {
      const { retentionHours, skipPinned = true } = options;
      const cutoffTime = new Date(Date.now() - retentionHours * 60 * 60 * 1000);
      
      let deletedCount = 0;
      let lastId: string | undefined;
      
      while (true) {
        const messages = await channel.messages.fetch({
          limit: 100,
          before: lastId,
        });

        if (messages.size === 0) break;

        const messagesToDelete = messages.filter(message => {
          if (skipPinned && message.pinned) return false;
          return message.createdAt < cutoffTime;
        });

        if (messagesToDelete.size === 0) break;

        // Bulk delete messages newer than 14 days
        const recentMessages = messagesToDelete.filter(
          msg => Date.now() - msg.createdAt.getTime() < 14 * 24 * 60 * 60 * 1000
        );

        if (recentMessages.size > 0) {
          await channel.bulkDelete(recentMessages);
          deletedCount += recentMessages.size;
        }

        // Delete older messages one by one
        const oldMessages = messagesToDelete.filter(
          msg => Date.now() - msg.createdAt.getTime() >= 14 * 24 * 60 * 60 * 1000
        );

        for (const [, message] of oldMessages) {
          await message.delete();
          deletedCount++;
        }

        lastId = messages.last()?.id;
      }

      return deletedCount;
    } catch (error) {
      logger.error('Error purging messages:', error);
      throw error;
    }
  }
}
