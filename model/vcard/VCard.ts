/**
 * Create a vcard collection with schema validation
 * @file VCard.ts
 * @exports VCard
 * @description VCard collection
 * @version 1.0.0
 * @requires mongodb
 * @requires Logging
 */

import db from "../../database/mongodb";
import { Logging } from "../../utils/Logging";

export default db()
    .then(async (connection) => {
        if (connection !== undefined) {
            // Check if the collection already exists
            const collections = await connection.listCollections().toArray();
            const collectionNames = collections.map(
                (collection) => collection.name
            );
            if (collectionNames.includes("vcards")) {
                console.log(`collection 'vcards' already exists`);

                return;
            }

            // Create the vcard collection including schema validation
            await connection.createCollection("vcards", {
                validator: {
                    $jsonSchema: {
                        bsonType: "object",
                        required: [
                            "firstname",
                            "lastname",
                            "email",
                            "phone",
                            "landline",
                        ],
                        properties: {
                            firstname: {
                                bsonType: "string",
                                description: "must be a string and is required",
                            },
                            lastname: {
                                bsonType: "string",
                                description: "must be a string and is required",
                            },
                            email: {
                                bsonType: "string",
                                description: "must be a string and is required",
                            },
                            phone: {
                                bsonType: "number",
                                description: "must be a number and is required",
                            },
                            landline: {
                                bsonType: "number",
                                description: "must be a number and is required",
                            },
                            socials: {
                                bsonType: "object",
                                description: "must be an object",
                                properties: {
                                    facebook: {
                                        bsonType: "string",
                                        description: "must be a string",
                                    },
                                    twitter: {
                                        bsonType: "string",
                                        description: "must be a string",
                                    },
                                    webpage: {
                                        bsonType: "string",
                                        description: "must be a string",
                                    },
                                    github: {
                                        bsonType: "string",
                                        description: "must be a string",
                                    },
                                },
                            },
                        },
                    },
                },
            });
        }
    })

    .catch((err) => {
        Logging.error(
            `Could not create collections: ${String(err)}`,
            "MONGODB"
        );
    });
