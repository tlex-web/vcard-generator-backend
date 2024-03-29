import dotenv from "dotenv";
import { CookieOptions } from "express-session";
import path from "path";
import { RedisClientOptions } from "redis";
import { MongoClientOptions, ServerApiVersion } from "mongodb";

import { Logging } from "../utils/Logging";
import { ENV, Config } from "../library/envVariables";

dotenv.config({ path: path.resolve(__dirname, ".env") });

// get all environment variables
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
        JWT_SALT: process.env.JWT_SALT,
        JWT_ALGORITHM: process.env.JWT_ALGORITHM,
        JWT_ISSUER: process.env.JWT_ISSUER,
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
        API_KEY: process.env.API_KEY,
    };
};

// check for missing environment variables
const getSanitizedConfig = (config: ENV): Config => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            Logging.error(`Missing key ${key} in config.env`, "ENV");
        }
    }
    return config as Config;
};

const config = getConfig();

// environment variables without missing variables
export const sanitizedConfig = getSanitizedConfig(config);

export const port =
    sanitizedConfig.NODE_ENV === "production" ? sanitizedConfig.PORT : 3001;

// mongodb configuration variables
export const mongodbConfig = {
    mongo: {
        uri: sanitizedConfig.MONGODB_URI.replace(
            "<username>",
            sanitizedConfig.MONGODB_USERNAME
        )
            .replace("<password>", sanitizedConfig.MONGODB_PASSWORD)
            .replace("<database>", sanitizedConfig.MONGODB_DB_NAME),
        db_name: sanitizedConfig.MONGODB_DB_NAME,
        // declare options for the mongodb client.
        // Use the current version of the driver
        // See https://mongodb.github.io/node-mongodb-native/5.2/interfaces/MongoClientOptions.html
        options: <MongoClientOptions>{
            serverApi: {
                version: ServerApiVersion.v1, // Use the current version of the driver
                strict: true,
                deprecationErrors: true,
            },
        },
    },
};

// REDIS session storage settings
export const redisConfig: RedisClientOptions = {
    socket: {
        host: sanitizedConfig.REDIS_HOST,
        port: sanitizedConfig.REDIS_PORT,
    },
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
