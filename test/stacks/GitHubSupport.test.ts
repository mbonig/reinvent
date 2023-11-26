import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { GitHubSupportStack } from '../../src/stacks/GitHubSupportStack';

test('GitHubSupport Snapshot', () => {
  const app = new App();
  const stack = new GitHubSupportStack(app, 'test', {});

  const assert = Template.fromStack(stack);
  expect(assert.toJSON()).toMatchSnapshot();
});
