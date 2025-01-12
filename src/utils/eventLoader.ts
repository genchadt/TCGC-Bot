    // src/utils/eventLoader.ts
    import { Client } from "discord.js";
    import * as fs from "fs";
    import { logger } from "./logger";

    export default (client: Client): void => {
        const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".ts"));

        for (const file of eventFiles) {
            const event = require(`../events/${file}`).default;
            const eventName = file.split(".")[0];
            client.on(eventName, event.bind(null, client));
            logger.info(`Loaded event: ${eventName}`);
        }
    };
    