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
const container = await cosmosClient
  .database(databaseName)
  .container(containerName);

// Find all products that match a property with a value like `value`
async function executeSqlFind(property, value) {
  // Build query
  const querySpec = {
    query: `select * from products p where p.${property} LIKE @propertyValue`,
    parameters: [
      {
        name: "@propertyValue",
        value: `${value}`,
      },
    ],
  };

  // Show query
  console.log(querySpec);

  // Get results
  const { resources } = await container.items.query(querySpec).fetchAll();

  let i = 0;

  // Show results of query
  for (const item of resources) {
    console.log(`${++i}: ${item.id}: ${item.name}, ${item.sku}`);
  }
}

// Find inventory of products with property/value and location
async function executeSqlInventory(property, value, location) {
  // Build query
  const querySpec = {
    query: `select p.id, p.name, i.location, i.inventory as inventory from products p JOIN i IN p.inventory where p.${property} LIKE @propertyValue AND i.location=@location`,

    parameters: [
      {
        name: "@propertyValue",
        value: `${value}`,
      },
      { name: "@location", value: `${location}` },
    ],
  };

  // Show query
  console.log(querySpec);

  // Get results
  const { resources } = await container.items.query(querySpec).fetchAll();

  let i = 0;

  // Show results of query
  console.log(`Looking for ${property}=${value}, location=${location}`);
  for (const item of resources) {
    console.log(
      `${++i}: ${item.id}: '${item.name}': current inventory = ${
        item.inventory
      }`
    );
  }
}

// Example queries
/*

// find all bikes based on partial match to property value

node 2-contoso-products-find.js find categoryName '%Bikes%'
node 2-contoso-products-find.js find name '%Blue%'

// find inventory at location on partial match to property value and specific location

node 2-contoso-products-find.js find-inventory categoryName '%Bikes%' Seattle
node 2-contoso-products-find.js find-inventory name '%Blue%' Dallas

*/
const args = process.argv;

if (args && args[2] == "find") {
  await executeSqlFind(args[3], args[4]);
} else if (args && args[2] == "find-inventory") {
  await executeSqlInventory(args[3], args[4], args[5]);
} else {
  console.log("products: no args used");
}
