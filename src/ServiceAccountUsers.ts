import * as fs from 'fs';
import path from 'path';
import { App } from 'aws-cdk-lib';
import { ServiceAccountUsersStack } from './stacks/ServiceAccountUsersStack';

const app = new App();

const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'data.json'), 'utf8'),
);

new ServiceAccountUsersStack(app, 'ServiceAccountUsers', {
  serviceAccounts: data.Items,
});

app.synth();
