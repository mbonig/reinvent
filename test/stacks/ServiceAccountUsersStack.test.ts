import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ServiceAccountUsersStack } from '../../src/stacks/ServiceAccountUsersStack';

test('ServiceAccountUsersStack Snapshot', () => {
  const app = new App();
  const stack = new ServiceAccountUsersStack(app, 'test', {
    serviceAccounts: [],
  });

  const assert = Template.fromStack(stack);
  expect(assert.toJSON()).toMatchSnapshot();
});
