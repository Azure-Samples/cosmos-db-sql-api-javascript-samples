# Variable for resource group name
resourceGroupName="msdocs-cosmos-quickstart-rg"
location="westus"

# Variable for account name with a randomnly generated suffix
let suffix=$RANDOM*$RANDOM
accountName="msdocs-$suffix"

az group create \
    --name $resourceGroupName \
    --location $location
    
az cosmosdb create \
--resource-group $resourceGroupName \
--name $accountName \
--locations regionName=$location

az cosmosdb show \
    --resource-group $resourceGroupName \
    --name $accountName \
    --query "documentEndpoint"
    
az cosmosdb keys list \
    --resource-group $resourceGroupName \
    --name $accountName \
    --type "keys" \
    --query "primaryMasterKey"
