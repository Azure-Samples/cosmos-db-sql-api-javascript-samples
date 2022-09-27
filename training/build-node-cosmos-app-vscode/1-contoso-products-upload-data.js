import * as path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get environment variables from .env
import * as dotenv from "dotenv";
dotenv.config();

// Get Cosmos Client
import { CosmosClient } from "@azure/cosmos";

// Provide required connection from environment variables
const cosmosSecret = process.env.COSMOS_CONNECTION_STRING;

// Authenticate to Azure Cosmos DB
const cosmosClient = new CosmosClient(cosmosSecret);

// add timeStamp to container name so script can run multiple times
// without issue
const timeStamp = Date.now()

// Set Database name and container name
const databaseName = process.env.COSMOS_DATABASE_NAME;
const containerName = `${process.env.COSMOS_CONTAINER_NAME}-${timeStamp}`;
const partitionKeyPath = [`/${process.env.COSMOS_CONTAINER_PARTITION_KEY}`];

// Create DB if it doesn't exist
const { database } = await cosmosClient.databases.createIfNotExists({
  id: databaseName,
});

// Create container if it doesn't exist
const { container } = await database.containers.createIfNotExists({
  id: containerName,
  partitionKey: {
    paths: partitionKeyPath,
  },
});

// Get product data
const fileAndPathToJson = "products.json";
const items = JSON.parse(await fs.readFile(path.join(__dirname, fileAndPathToJson), "utf-8"));

let i = 0;

// Insert products into container
for (const item of items) {
  const { resource } = await container.items.create(item);
  console.log(`[${i++}] - '${resource.name}' inserted`);
}

// Show container name - copy/paste into .env
console.log(`\n\ncontainerName: ${containerName}`);// 

// Run script with 
// node 1-contoso-products-upload-data.js