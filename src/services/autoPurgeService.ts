import { Client, TextChannel } from 'discord.js';
import { MessageService } from './messageService';
import { logger } from '../utils/logger';
import config from '../config/channels.json';
import { DateTime } from 'luxon';
import { ChannelConfig } from '../types';

export class AutoPurgeService {
    private static instance: AutoPurgeService;
    private client: Client;
    private messageService: MessageService;
    private intervals: Map<string, NodeJS.Timeout> = new Map();
    
    // Default to running every 5 minutes if not specified in channel config
    private readonly DEFAULT_CHECK_INTERVAL = 5 * 60 * 1000;

    private constructor(client: Client) {
        this.client = client;
        this.messageService = MessageService.getInstance();
    }

    public static getInstance(client: Client): AutoPurgeService {
        if (!AutoPurgeService.instance) {
            AutoPurgeService.instance = new AutoPurgeService(client);
        }
        return AutoPurgeService.instance;
    }

    public start(): void {
        logger.info('Starting auto-purge service');
        
        // Run initial purge
        this.purgeAllConfiguredChannels();
        
        // Set up intervals for each channel based on their configurations
        this.setupIntervals();
    }

    public stop(): void {
        // Clear all intervals
        for (const [channelId, interval] of this.intervals) {
            clearInterval(interval);
            logger.info(`Stopped auto-purge for channel ${channelId}`);
        }
        this.intervals.clear();
        logger.info('Stopped auto-purge service');
    }

    private setupIntervals(): void {
        // Clear existing intervals
        this.stop();

        // Set up new intervals based on configuration
        for (const guildConfig of config.purgeChannels) {
            if (!guildConfig.enabled) continue;

            for (const channelConfig of guildConfig.channels) {
                if (!channelConfig.enabled) continue;

                const interval = channelConfig.schedule?.checkIntervalMinutes 
                    ? channelConfig.schedule.checkIntervalMinutes * 60 * 1000
                    : this.DEFAULT_CHECK_INTERVAL;

                const intervalId = setInterval(() => {
                    this.purgeChannel(guildConfig.guildId, channelConfig);
                }, interval);

                this.intervals.set(channelConfig.id, intervalId);
                logger.info(
                    `Set up auto-purge for channel ${channelConfig.name} (${channelConfig.id}) ` +
                    `with interval of ${interval / 1000} seconds`
                );
            }
        }
    }

    private isWithinActiveHours(schedule?: ChannelConfig['schedule']): boolean {
        if (!schedule?.activeHours) return true;

        const now = DateTime.now().setZone(schedule.timezone || 'UTC');
        const hour = now.hour;

        const { start, end } = schedule.activeHours;
        if (start <= end) {
            return hour >= start && hour < end;
        } else {
            // Handles cases where the range crosses midnight
            return hour >= start || hour < end;
        }
    }

    private async purgeChannel(guildId: string, channelConfig: ChannelConfig): Promise<void> {
        try {
            // Check if we should run based on schedule
            if (!this.isWithinActiveHours(channelConfig.schedule)) {
                logger.debug(
                    `Skipping purge for ${channelConfig.name} - outside active hours`
                );
                return;
            }

            const guild = await this.client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelConfig.id);

            if (!(channel instanceof TextChannel)) {
                logger.warn(
                    `Channel ${channelConfig.id} is not a text channel`
                );
                return;
            }

            const purged = await this.messageService.purgeMessages(
                channel,
                channelConfig.filters
            );

            if (purged > 0) {
                logger.info(
                    `Auto-purged ${purged} messages from ${channel.name} in ${guild.name}`
                );
            } else {
                logger.debug(
                    `No messages to purge in ${channel.name} (${guild.name})`
                );
            }

        } catch (error) {
            logger.error(
                `Error purging channel ${channelConfig.id} in guild ${guildId}:`,
                error
            );
        }
    }

    private async purgeAllConfiguredChannels(): Promise<void> {
        try {
            for (const guildConfig of config.purgeChannels) {
                if (!guildConfig.enabled) {
                    logger.debug(`Skipping disabled guild ${guildConfig.guildId}`);
                    continue;
                }

                const guild = await this.client.guilds.fetch(guildConfig.guildId);
                
                for (const channelConfig of guildConfig.channels) {
                    if (!channelConfig.enabled) {
                        logger.debug(`Skipping disabled channel ${channelConfig.name}`);
                        continue;
                    }

                    await this.purgeChannel(guildConfig.guildId, channelConfig);
                }
            }
        } catch (error) {
            logger.error('Error in auto-purge service:', error);
        }
    }

    // Method to manually trigger a purge for testing or manual operation
    public async triggerPurge(guildId: string, channelId: string): Promise<void> {
        const guildConfig = config.purgeChannels.find(g => g.guildId === guildId);
        if (!guildConfig) {
            throw new Error(`No configuration found for guild ${guildId}`);
        }

        const channelConfig = guildConfig.channels.find(c => c.id === channelId);
        if (!channelConfig) {
            throw new Error(`No configuration found for channel ${channelId}`);
        }

        await this.purgeChannel(guildId, channelConfig);
    }

    // Method to reload configuration and update intervals
    public reloadConfiguration(): void {
        logger.info('Reloading auto-purge configuration');
        this.setupIntervals();
    }

    // Method to get current service status
    public getStatus(): Record<string, unknown> {
        return {
            activeIntervals: Array.from(this.intervals.keys()),
            defaultCheckInterval: this.DEFAULT_CHECK_INTERVAL,
            running: this.intervals.size > 0,
            timestamp: new Date().toISOString()
        };
    }
}
