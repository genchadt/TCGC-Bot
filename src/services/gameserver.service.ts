// src/services/gameserver.service.ts
import { exec } from "child_process";
import { logger } from "../utils/logger";
import { gameServerConfigs } from "../config/gameserver.config";

/**
 * Starts a game server (daemon or Docker).
 * @param serverName - The name of the game server to start.
 */
export const startGameServer = async (serverName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const serverConfig = gameServerConfigs.find((config) => config.name === serverName);

        if (!serverConfig) {
            logger.error(`Game server configuration not found for: ${serverName}`);
            reject(new Error(`Game server configuration not found for: ${serverName}`));
            return;
        }

        exec(serverConfig.startCommand, (error, stdout, stderr) => {
            if (error) {
                logger.error(`Error starting game server (${serverName}): ${stderr}`);
                reject(error);
            } else {
                logger.info(`Game server started (${serverName}). Output: ${stdout.trim()}`);
                resolve();
            }
        });
    });
};

/**
 * Stops a game server (daemon or Docker).
 * @param serverName - The name of the game server to stop.
 */
export const stopGameServer = async (serverName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const serverConfig = gameServerConfigs.find((config) => config.name === serverName);

        if (!serverConfig) {
            logger.error(`Game server configuration not found for: ${serverName}`);
            reject(new Error(`Game server configuration not found for: ${serverName}`));
            return;
        }

        exec(serverConfig.stopCommand, (error, stdout, stderr) => {
            if (error) {
                logger.error(`Error stopping game server (${serverName}): ${stderr}`);
                reject(error);
            } else {
                logger.info(`Game server stopped (${serverName}). Output: ${stdout.trim()}`);
                resolve();
            }
        });
    });
};

/**
 * Retrieves the status of a game server (daemon or Docker).
 * @param serverName - The name of the game server to check.
 * @returns A string indicating the server's status.
 */
export const getGameServerStatus = async (serverName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const serverConfig = gameServerConfigs.find((config) => config.name === serverName);

        if (!serverConfig) {
            logger.error(`Game server configuration not found for: ${serverName}`);
            reject(new Error(`Game server configuration not found for: ${serverName}`));
            return;
        }

        exec(serverConfig.statusCommand, (error, stdout, stderr) => {
            if (error) {
                logger.error(`Error checking game server status (${serverName}): ${stderr}`);
                resolve(`Game server "${serverName}" is stopped.`);
            } else {
                logger.info(`Game server status check (${serverName}): ${stdout.trim()}`);
                resolve(`Game server "${serverName}" is running.`);
            }
        });
    });
};
