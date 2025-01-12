// src/config/gameserver.config.ts
export interface GameServerConfig {
    name: string;               // Name of the game server
    type: "daemon" | "docker";  // Type of server (daemon or Docker)
    startCommand: string;       // Command to start the server
    stopCommand: string;        // Command to stop the server
    statusCommand: string;      // Command to check the server status
    portMappings?: string[];    // Optional: Port mappings for Docker containers
    dockerImage?: string;       // Optional: Docker image for Docker containers
    containerName?: string;     // Optional: Docker container name
}


export const gameServerConfigs: GameServerConfig[] = [
    {
        name: "csgo-daemon", // Example: Counter-Strike: Global Offensive server (daemon)
        type: "daemon",
        startCommand: "path/to/csgo/server/binary --args", // Replace with the actual command
        stopCommand: "pkill -f csgo-server-binary", // Replace with the actual command
        statusCommand: "pgrep -af csgo-server-binary", // Replace with the actual command
    },
    {
        name: "minecraft-docker", // Example: Minecraft server (Docker)
        type: "docker",
        dockerImage: "itzg/minecraft-server:latest", // Docker image for Minecraft server
        containerName: "minecraft-server-container",
        portMappings: ["25565:25565/tcp"], // Map TCP port 25565
        startCommand: "docker run -d --name minecraft-server-container -p 25565:25565/tcp itzg/minecraft-server:latest",
        stopCommand: "docker stop minecraft-server-container && docker rm minecraft-server-container",
        statusCommand: "docker ps --filter name=minecraft-server-container",
    },
];
