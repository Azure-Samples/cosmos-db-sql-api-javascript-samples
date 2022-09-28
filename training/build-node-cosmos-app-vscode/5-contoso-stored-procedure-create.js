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
 
// add timeStamp to container name so script can run multiple times
// without issue
const timeStamp = Date.now()

const helloWorldFunction = function () {
  var context = getContext();
  var response = context.getResponse();

  response.setBody("Hello, World");
};


// Add stored procedure to container
const helloWorldStoredProcId = `spHelloWorld4-${timeStamp}`;
const { resource } = await container.scripts.storedProcedures.create({
    id: helloWorldStoredProcId,
    body: helloWorldFunction
});
console.log(`SpId: ${resource.id}`);
