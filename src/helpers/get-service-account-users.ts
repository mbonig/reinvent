// get-service-account-users.ts
import * as fs from 'fs';
import path from 'path';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

async function someApiCall() {
  return DynamoDBDocumentClient.from(new DynamoDBClient({}))
    .send(new ScanCommand({ TableName: 'MyServiceAccountUsers' }));
}

someApiCall().then(data => {
  fs.writeFileSync(
    path.join(__dirname, '..', 'data.json'),
    JSON.stringify(data, null, 2),
  );
}).catch(console.error);

