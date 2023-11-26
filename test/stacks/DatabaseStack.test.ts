import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack, DatabaseStackProps } from '../../src/stacks/DatabaseStack';

describe('DatabaseStack Snapshot', () => {
  function getTestStack(props?: Partial<DatabaseStackProps>) {
    const app = new App();
    const stack = new DatabaseStack(app, 'test', {
      isPrimary: true,
      tablePrefix: 'test',
      env: {
        account: '000011112222',
        region: 'us-east-1',
      },
      ...props,
    });

    const assert = Template.fromStack(stack);
    return assert;
  }

  test('isPrimary', () => {
    const assert = getTestStack();
    expect(assert.toJSON()).toMatchSnapshot();
  });

  test('isPrimary is false', () => {
    const assert = getTestStack({
      isPrimary: false,
    });

    expect(assert.toJSON()).toMatchSnapshot();
  });

});
