import sql, { ConnectionPool } from "mssql";
import logger from "@/lib/logger";

const config = {
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    server: process.env.DB_SERVER || "",
    database: process.env.DB_DATABASE || "",
    options: {
        encrypt: process.env.DB_ENCRYPT === "true", // for production
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true", // local dev
    },
    pool: {
        max: Number(process.env.DB_POOL_MAX) || 10,
        min: Number(process.env.DB_POOL_MIN) || 0,
        idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT_MILLIS) || 30000,
    },
};

// global pool to persist across hot reloads / production
let pool: ConnectionPool | undefined;

export async function getDbConnection(): Promise<ConnectionPool> {
    try {
        if (pool?.connected) {
            console.log("Using existing DB connection");
            logger.info("Using existing DB connection");
            return pool;
        }

        if (pool && !pool.connected && !pool.connecting) {
            await pool.close();
            pool = undefined;
        }

        const newPool = await sql.connect(config);
        pool = newPool;
        logger.info("Database connected successfully ✅");

        return newPool;
    } catch (error: any) {
        logger.error(`Database connection failed ❌: ${error.message}`);
        pool = undefined;
        throw error;
    }
}