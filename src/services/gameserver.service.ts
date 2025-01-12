// src/services/gameserver.service.ts
import { exec } from "child_process";
import { logger } from "../utils/logger";

export const startGameServer = async (): Promise<void> => {
    // TODO: Implement logic to start the game server
    logger.info("Game server started.");
};

export const stopGameServer = async (): Promise<void> => {
    // TODO: Implement logic to stop the game server
    logger.info("Game server stopped.");
};
