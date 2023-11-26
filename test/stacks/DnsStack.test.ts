import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DnsStack } from '../../src/stacks/DnsStack';

test('DnsStack Snapshot', () => {
  const app = new App();
  const stack = new DnsStack(app, 'test', {
    websiteDomainName: 'reinvent.matthewbonig.com',
    env: {
      account: '000011112222',
      region: 'us-east-1',
    },

  });
  const assert = Template.fromStack(stack);

  expect(assert.toJSON()).toMatchSnapshot();
});
