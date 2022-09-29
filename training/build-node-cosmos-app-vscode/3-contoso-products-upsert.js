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

// Set Database name and container name
const databaseName = process.env.COSMOS_DATABASE_NAME;
const containerName = process.env.COSMOS_CONTAINER_NAME;

// Get Container
const container = await cosmosClient.database(databaseName).container(containerName);

// Either insert or update item
async function upsert(fileAndPathToJson, encoding='utf-8') {

  // Get item from file
  const data = JSON.parse(await fs.readFile(path.join(__dirname, fileAndPathToJson), encoding));

  // Process request
  // result.resource is the returned item
  const result = await container.items.upsert(data);

  if(result.statusCode===201){
    console.log("Inserted data");
  } else if (result.statusCode===200){
    console.log("Updated data");
  } else {
    console.log(`unexpected statusCode ${result.statusCode}`);
  }
}

// Insert data - statusCode = 201
await upsert('./3-contoso-products-upsert-insert.json');

// Update data - statusCode = 200
await upsert('./3-contoso-products-upsert-update.json');

// Get item from container and partition key
const { resource } = await container.item("123", "xyz").read();

// Show final item
console.log(resource);