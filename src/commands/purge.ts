import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  TextChannel,
  ChannelType
} from 'discord.js';
import { MessageService } from '../services/messageService';
import { Command } from '../types';
import { logger } from '../utils/logger';
import config from '../config/channels.json';

export const purgeCommand: Command = {
  data: new SlashCommandBuilder()
      .setName('purge')
      .setDescription('Purge messages from configured channels')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .addChannelOption(option =>
          option
              .setName('channel')
              .setDescription('Channel to purge (optional, defaults to all configured channels)')
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(false)
      ) as SlashCommandBuilder,
  
    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply({ ephemeral: true });
  
      try {
        const messageService = MessageService.getInstance();
        const guildConfig = config.purgeChannels.find(
          gc => gc.guildId === interaction.guildId
        );
  
        if (!guildConfig) {
          await interaction.editReply('This server has no configured channels for purging.');
          return;
        }
  
        const targetChannel = interaction.options.getChannel('channel');
        let totalPurged = 0;
  
        if (targetChannel) {
          const channelConfig = guildConfig.channels.find(c => c.id === targetChannel.id);
          if (!channelConfig) {
            await interaction.editReply('This channel is not configured for purging.');
            return;
          }
  
          if (!(targetChannel instanceof TextChannel)) {
            await interaction.editReply('Invalid channel type. Must be a text channel.');
            return;
          }
  
          const purged = await messageService.purgeMessages(targetChannel, {
            channelId: targetChannel.id,
            retentionHours: channelConfig.retentionHours,
          });
          totalPurged += purged;
        } else {
          // Purge all configured channels
          for (const channelConfig of guildConfig.channels) {
            const channel = await interaction.guild?.channels.fetch(channelConfig.id);
            if (channel instanceof TextChannel) {
              const purged = await messageService.purgeMessages(channel, {
                channelId: channel.id,
                retentionHours: channelConfig.retentionHours,
              });
              totalPurged += purged;
            }
          }
        }
  
        await interaction.editReply(
          `Successfully purged ${totalPurged} messages from ${
            targetChannel ? 'the specified channel' : 'all configured channels'
          }.`
        );
      } catch (error) {
        logger.error('Error executing purge command:', error);
        await interaction.editReply('An error occurred while purging messages.');
      }
    },
  };
  