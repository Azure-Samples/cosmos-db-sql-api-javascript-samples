# Variable for resource group name
resourceGroupName="msdocs-cosmos-quickstart-rg"
location="westus"

# Variable for account name with a randomnly generated suffix
let suffix=$RANDOM*$RANDOM
accountName="msdocs-$suffix"

# Create resource group in default subscription
az group create \
    --name $resourceGroupName \
    --location $location
    
# Create Cosmos DB resource
az cosmosdb create \
--resource-group $resourceGroupName \
--name $accountName \
--locations regionName=$location

# Show endpoint - copy to .env
az cosmosdb show \
    --resource-group $resourceGroupName \
    --name $accountName \
    --query "documentEndpoint"
    
# Show key - copy to .env
az cosmosdb keys list \
    --resource-group $resourceGroupName \
    --name $accountName \
    --type "keys" \
    --query "primaryMasterKey"
