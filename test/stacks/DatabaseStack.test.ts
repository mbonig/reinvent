import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack, DatabaseStackProps } from '../../src/stacks/DatabaseStack';

describe('DatabaseStack Snapshot', () => {
  function getTestStack(props?: Partial<DatabaseStackProps>) {
    const app = new App();
    const stack = new DatabaseStack(app, 'test', {
      tablePrefix: 'test',
      env: {
        account: '000011112222',
        region: 'us-east-1',
      },
      ...props,
    });

    return Template.fromStack(stack);
  }

  test('matches snapshot', () => {
    const assert = getTestStack();
    expect(assert.toJSON()).toMatchSnapshot();
  });
});
