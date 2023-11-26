import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BucketReplicationStack } from '../../src/stacks/BucketReplicationStack';

test('BucketReplicationStack Snapshot', () => {
  const app = new App();
  const stack = new BucketReplicationStack(app, 'test', {
    buckets: [
      'test-source-bucket',
    ],
  });

  const assert = Template.fromStack(stack);
  expect(assert.toJSON()).toMatchSnapshot();
});
