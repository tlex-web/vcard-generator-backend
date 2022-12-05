import dotenv from "dotenv";
import { CookieOptions } from "express-session";
import path from "path";
import { RedisClientOptions } from "redis";
import { Logging } from "../utils/Logging";

dotenv.config({ path: path.resolve(__dirname, ".env") });

// MONGODB driver settings
interface ENV {
    APP_NAME: string | undefined;
    NODE_ENV: string | undefined;
    PORT: number | undefined;
    SESSION_SECRET: string | undefined;
    MONGODB_USERNAME: string | undefined;
    MONGODB_PASSWORD: string | undefined;
    MONGODB_DB_NAME: string | undefined;
    MONGODB_URI: string | undefined;
    SALT: string | undefined;
    JWT_EXPIRES: number | undefined;
    COOKIE_EXPIRES: number | undefined;
    REDIS_USERNAME: string | undefined;
    REDIS_PASSWORD: string | undefined;
    REDIS_HOST: string | undefined;
    REDIS_PORT: number | undefined;
    SMTP_HOST: string | undefined;
    SMTP_PORT: number | undefined;
    SMTP_USERNAME: string | undefined;
    SMTP_PASSWORD: string | undefined;
}

interface Config {
    APP_NAME: string;
    NODE_ENV: string;
    PORT: number;
    SESSION_SECRET: string;
    MONGODB_USERNAME: string;
    MONGODB_PASSWORD: string;
    MONGODB_DB_NAME: string;
    MONGODB_URI: string;
    SALT: string;
    JWT_EXPIRES: number;
    COOKIE_EXPIRES: number;
    REDIS_USERNAME: string;
    REDIS_PASSWORD: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USERNAME: string;
    SMTP_PASSWORD: string;
}

const getConfig = (): ENV => {
    return {
        APP_NAME: process.env.APP_NAME,
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
        SESSION_SECRET: process.env.SESSION_SECRET,
        MONGODB_USERNAME: process.env.MONGODB_USERNAME,
        MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
        MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
        MONGODB_URI: process.env.MONGODB_URI,
        SALT: process.env.SALT,
        JWT_EXPIRES: process.env.JWT_EXPIRES
            ? Number(process.env.JWT_EXPIRES)
            : undefined,
        COOKIE_EXPIRES: process.env.COOKIE_EXPIRES
            ? Number(process.env.COOKIE_EXPIRES)
            : undefined,
        REDIS_USERNAME: process.env.REDIS_USERNAME,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT
            ? Number(process.env.REDIS_PORT)
            : undefined,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT
            ? Number(process.env.SMTP_PORT)
            : undefined,
        SMTP_USERNAME: process.env.SMTP_USERNAME,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    };
};

const getSanitizedConfig = (config: ENV): Config => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            Logging.error(`Missing key ${key} in config.env`, "ENV");
        }
    }
    return config as Config;
};

const config = getConfig();

export const sanitizedConfig = getSanitizedConfig(config);

export const port =
    sanitizedConfig.NODE_ENV === "production" ? sanitizedConfig.PORT : 3001;

export const mongodbConfig = {
    mongo: {
        uri: sanitizedConfig.MONGODB_URI.replace(
            "<username>",
            sanitizedConfig.MONGODB_USERNAME
        )
            .replace("<password>", sanitizedConfig.MONGODB_PASSWORD)
            .replace("<database>", sanitizedConfig.MONGODB_DB_NAME),
        // Since Mongoose v.6 the url parser and unified index are used by default
        options: {},
    },
};

// REDIS session storage settings
export const redisConfig: RedisClientOptions = {
    socket: {
        host: sanitizedConfig.REDIS_HOST,
        port: sanitizedConfig.REDIS_PORT,
    },
    legacyMode: true,
};

// RATE_LIMITER settings

export const rateLimiterOptions = {
    points: 6, // Total points available per ID
    duration: 1, // Seconds between requests
};

export const cookieOptions: CookieOptions = {
    // expires in n days after creation
    expires: new Date(
        new Date().setDate(
            new Date().getDate() + sanitizedConfig.COOKIE_EXPIRES
        )
    ),
    // prevent client JS access to cookie data
    httpOnly: true,
    // TLS protection
    secure: sanitizedConfig.NODE_ENV === "production" ? true : false,
};
