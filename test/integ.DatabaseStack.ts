// integ.DatabaseStack.ts
import { IntegTest } from '@aws-cdk/integ-tests-alpha';
import { App } from 'aws-cdk-lib';
import { DatabaseStack } from '../src/stacks/DatabaseStack';

const app = new App();
const stack = new DatabaseStack(
  app,
  'IntegrationTest-Database',
  {
    isPrimary: true,
    env: {
      account: '536309290949',
      region: 'us-east-1',
    },
    tablePrefix: 'test',
  },
);

new IntegTest(app, 'Integ', { testCases: [stack] });


