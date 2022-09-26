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
const key = process.env.COSMOS_KEY;
// Endpoint format: https://YOUR-RESOURCE-NAME.documents.azure.com:443/
const endpoint = process.env.COSMOS_ENDPOINT;
// Authenticate to Azure Cosmos DB
const cosmosClient = new CosmosClient({ endpoint, key });

// Set Database name and container name
const databaseName = process.env.COSMOS_DATABASE_NAME;
const containerName = process.env.COSMOS_CONTAINER_NAME;

// Get Container
const container = await cosmosClient.database(databaseName).container(containerName);

// Either insert or update item
async function upsert(fileAndPathToJson, encoding='utf-8') {

  // Get item from file
  const data = JSON.parse(await fs.readFile(path.join(__dirname, fileAndPathToJson), encoding));

  // Show request item
  console.log("Request");
  console.log(data);

  // Process request
  const { resource } = await container.items.upsert(data);

  // Show response item
  console.log("\nResponse");
  console.log(resource);
}

// Insert data - id = 123, no inventory
await upsert('./3-contoso-products-upsert-insert.json');

// Update data - id = 123, inventory locations
await upsert('./3-contoso-products-upsert-update.json');

// Get item from container and partition key
const { resource } = await container.item("123", "xyz").read();

// Show final item
console.log(`\nGet item from DB by Id`);
console.log(resource);
