// src/services/database.service.ts
import { Pool } from "pg";
import { logger } from "../utils/logger";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const connectToDatabase = async (): Promise<void> => {
    try {
        await pool.query("SELECT NOW()"); // Test connection
        logger.info("Connected to PostgreSQL database!");
    } catch (error) {
        logger.error("Error connecting to database:", error);
        throw error;
    }
};

export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info("executed query", { text, duration, rows: res.rowCount });
    return res;
};