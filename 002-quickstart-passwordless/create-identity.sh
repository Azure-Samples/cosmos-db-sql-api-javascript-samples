# Create role, save the `name` value for use as `your-custom-role-id`
az cosmosdb sql role definition create 
    --account-name <YOUR-COSMOS-DB-RESOURCE-NAME>
    --resource-group <YOUR-RESOURCE-GROUP>
    --body '{
    "RoleName": "PasswordlessReadWrite",
    "Type": "CustomRole",
    "AssignableScopes": ["/"],
    "Permissions": [{
        "DataActions": [
            "Microsoft.DocumentDB/databaseAccounts/readMetadata",
            "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/*",
            "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/*"
        ]
    }]
}'

# Get user ID for use as `your-user-id`
az ad user show --id "<your-email-address>"

# Create role assignment
az cosmosdb sql role assignment create 
    --account-name <YOUR-COSMOS-DB-RESOURCE-NAME>
    --resource-group <YOUR-RESOURCE-GROUP>
    --scope "/" 
    --principal-id <your-user-id>
    --role-definition-id <your-custom-role-id>