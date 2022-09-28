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
const container = await cosmosClient
  .database(databaseName)
  .container(containerName);

async function getItems(container, maxPrice) {
  const querySpec = {
    query: `select * from products where products.price < @maxPrice`,

    parameters: [
      {
        name: "@maxPrice",
        value: Number(maxPrice),
      },
    ],
  };

  console.log(querySpec);

  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources;
}
async function updateItems(container, items, percentageIncrease) {
  for (const item of items) {
    // increase price
    item.price = item.price * Number(percentageIncrease);

    // update product in container
    await container.items.upsert(item);
  }

  return items;
}

async function updatePrices(container, lowPriceItems, percentageIncrease) {
  // Nothing to do
  if (
    !container ||
    !lowPriceItems ||
    lowPriceItems.length === 0 ||
    !percentageIncrease
  ) {
    return [];
  }

  const updatedItems = await updateItems(
    container,
    lowPriceItems,
    percentageIncrease
  );

  return updatedItems;
}

let maxPrice = 10;
let percentageIncrease = 1.1;

/*
args[2] = max price to search for
args[3] = percentage increase in price for items found

node 4-contoso-update-prices.js 4 1.10

*/
const args = process.argv;
if (args && args[2]) {
  maxPrice = args[2];
}
if (args && args[3]) {
  percentageIncrease = args[3];
}

// Show database and container name, priceMax and percentageIncrease
console.log(`${databaseName}:${containerName}`);
console.log(`Increase items less than ${maxPrice} by ${percentageIncrease}%`);

// Find items
const lowPriceItems = await getItems(container, maxPrice);
const originalPriceItems = JSON.parse(JSON.stringify(lowPriceItems));
console.log(`${lowPriceItems.length} items matched max price ${maxPrice}`);

// Update items
if (!percentageIncrease) {
  process.exit();
}
const updatedItems = await updatePrices(
  container,
  lowPriceItems,
  percentageIncrease
);

// Show change in price
for (let item of updatedItems) {
  console.log(
    `${item.name}, original price: ${
      originalPriceItems.find((x) => x.id === item.id).price
    }, new price:  ${item.price}`
  );
}
