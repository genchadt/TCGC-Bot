// src/config/purge.config.ts
import { PurgeConfig } from "../types";

export const purgeConfig: PurgeConfig = {
    defaultCheckInterval: 3600, // 1 hour
    rules: [
        {
            channelIds: ["channel_id_1"],
            includeUserGroups: ["role_id_bots"],
            excludeUserGroups: [],
            pinned: false,
            messageAge: 21600, // 6 hours
            checkInterval: 1800, // 30 minutes (optional override)
        },
    ],
};
