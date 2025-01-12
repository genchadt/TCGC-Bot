// src/utils/discord.utils.ts
import { Message } from "discord.js";

export const isWithinMessageAge = (message: Message, maxAgeSeconds: number): boolean => {
    const now = Date.now();
    const messageTimestamp = message.createdTimestamp;
    const messageAgeSeconds = (now - messageTimestamp) / 1000;
    return messageAgeSeconds >= maxAgeSeconds; 
};
