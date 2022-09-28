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
 
// add timeStamp to sp name so script can run multiple times
// without issue
const timeStamp = Date.now()

// SAMPLE STORED PROCEDURE
function sampleFunction(prefix) {
  var collection = getContext().getCollection();

  // Query documents and take 1st item.
  var isAccepted = collection.queryDocuments(
      collection.getSelfLink(),
      'SELECT * FROM root r',
  function (err, feed, options) {
      if (err) throw err;
 
      // Check the feed and if empty, set the body to 'no docs found', 
      // else take 1st element from feed
      if (!feed || !feed.length) {
          var response = getContext().getResponse();
          response.setBody('no docs found');
      }
      else {
          var response = getContext().getResponse();
          var body = { prefix: prefix, feed: feed[0] };
          response.setBody(JSON.stringify(body));
      }
  });

  if (!isAccepted) throw new Error('The query was not accepted by the server.');
}


// Add stored procedure to container
const sampleStoredProcId = `spSampleFunction-${timeStamp}`;
const { resource } = await container.scripts.storedProcedures.create({
    id: sampleStoredProcId,
    body: sampleFunction
});
console.log(`SpId: ${resource.id}`);
