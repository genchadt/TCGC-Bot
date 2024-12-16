import { 
  Message, 
  TextChannel, 
  GuildMember, 
  Collection 
} from 'discord.js';
import { MessageFilter } from '../types';
import { logger } from '../utils/logger';

export class MessageService {
  private static instance: MessageService;

  private constructor() {}

  public static getInstance(): MessageService {
      if (!MessageService.instance) {
          MessageService.instance = new MessageService();
      }
      return MessageService.instance;
  }

  private async shouldKeepMessage(
      message: Message,
      filter: MessageFilter,
      member?: GuildMember
  ): Promise<boolean> {
      // Time-based check
      const messageAge = Date.now() - message.createdTimestamp;
      if (messageAge < filter.retentionHours * 60 * 60 * 1000) {
          return true;
      }

      // Pinned message check
      if (filter.skipPinned && message.pinned) {
          return true;
      }

      // Bot message check
      if (!filter.includeBots && message.author.bot) {
          return true;
      }

      // User inclusion/exclusion check
      if (filter.includeUsers?.length && !filter.includeUsers.includes(message.author.id)) {
          return true;
      }
      if (filter.excludeUsers?.length && filter.excludeUsers.includes(message.author.id)) {
          return true;
      }

      // Role checks
      if (member) {
          if (filter.includeRoles?.length && 
              !member.roles.cache.some(role => filter.includeRoles!.includes(role.id))) {
              return true;
          }
          if (filter.excludeRoles?.length && 
              member.roles.cache.some(role => filter.excludeRoles!.includes(role.id))) {
              return true;
          }
      }

      // Reaction checks
      if (filter.minReactions && message.reactions.cache.size >= filter.minReactions) {
          return true;
      }
      if (filter.skipStarred && message.reactions.cache.has('⭐')) {
          return true;
      }

      // Content checks
      const content = message.content.toLowerCase();
      if (filter.includeKeywords?.length && 
          !filter.includeKeywords.some(keyword => 
              content.includes(keyword.toLowerCase()))) {
          return true;
      }
      if (filter.excludeKeywords?.length && 
          filter.excludeKeywords.some(keyword => 
              content.includes(keyword.toLowerCase()))) {
          return true;
      }

      // Attachment checks
      if (!filter.includeFiles && message.attachments.size > 0) {
          return true;
      }
      if (!filter.includeImages && 
          message.attachments.some(att => 
              att.contentType?.startsWith('image/'))) {
          return true;
      }
      if (!filter.includeEmbeds && message.embeds.length > 0) {
          return true;
      }

      return false; // Message should be deleted
  }

  public async purgeMessages(
      channel: TextChannel, 
      filter: MessageFilter
  ): Promise<number> {
      try {
          let deletedCount = 0;
          let lastId: string | undefined;

          while (true) {
              const messages = await channel.messages.fetch({
                  limit: 100,
                  before: lastId,
              });

              if (messages.size === 0) break;

              const messagesToDelete: Collection<string, Message> = 
                  new Collection();

              for (const [id, message] of messages) {
                  const member = message.member || 
                      await message.guild?.members.fetch(message.author.id)
                          .catch(() => undefined);

                  const shouldKeep = await this.shouldKeepMessage(
                      message, 
                      filter, 
                      member
                  );

                  if (!shouldKeep) {
                      messagesToDelete.set(id, message);
                  }
              }

              if (messagesToDelete.size === 0) break;

              // Handle bulk deletion for messages < 14 days old
              const recentMessages = messagesToDelete.filter(
                  msg => Date.now() - msg.createdTimestamp < 
                      14 * 24 * 60 * 60 * 1000
              );

              if (recentMessages.size > 0) {
                  await channel.bulkDelete(recentMessages);
                  deletedCount += recentMessages.size;
              }

              // Handle older messages individually
              const oldMessages = messagesToDelete.filter(
                  msg => Date.now() - msg.createdTimestamp >= 
                      14 * 24 * 60 * 60 * 1000
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
