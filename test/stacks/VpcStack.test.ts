import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { VpcStack } from '../../src/stacks/VpcStack';

test('VpcStack Snapshot', () => {
  const app = new App();
  const stack = new VpcStack(app, 'test', {
    cidr: '10.0.0.0/18',
  });

  const assert = Template.fromStack(stack);
  expect(assert.toJSON()).toMatchSnapshot();
});
