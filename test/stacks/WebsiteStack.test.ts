import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { AssetImage } from 'aws-cdk-lib/aws-ecs';
import { ContainerImageConfig } from 'aws-cdk-lib/aws-ecs/lib/container-image';
import { Code, CodeConfig } from 'aws-cdk-lib/aws-lambda';
import { WebsiteStack } from '../../src/stacks/WebsiteStack';

let fromAssetMock;
let fromLambdaAssetMock;
beforeAll(() => {
  fromAssetMock = jest.spyOn(AssetImage, 'fromAsset')
    .mockReturnValue({
      isInline: false,
      bind: (): ContainerImageConfig => {
        return {
          imageName: 'whatever',
        };
      },
      bindToResource: () => {
        return;
      },
    } as any);

  fromLambdaAssetMock = jest.spyOn(Code, 'fromAsset').mockReturnValue({
    isInline: false,
    bind: (): CodeConfig => {
      return {
        s3Location: {
          bucketName: 'my-bucket',
          objectKey: 'my-key',
        },
      };
    },
    bindToResource: () => {
      return;
    },
  } as any);
});

afterAll(() => {
  fromAssetMock!.mockRestore();
  fromLambdaAssetMock!.mockRestore();
});

test('WebsiteStack Snapshot', () => {
  // arrange
  const app = new App();
  const testEnv = {
    account: '000011112222', region: 'us-east-1',
  };

  // act
  let testStack = new Stack(app, 'VpcTestStack', { env: testEnv });
  const stack = new WebsiteStack(app, 'test', {
    env: testEnv,
    websiteDomainName: 'test',
    tables: [],
    tablePrefix: 'test',
    vpc: new Vpc(testStack, 'Vpc'),
    replicationRoleArn: 'arn:aws:iam::000011112222:role/BucketReplication-ReplicationRoleCE149CEC-tZp8bWrelieK',
  });

  // assert
  const assert = Template.fromStack(stack);
  expect(assert.toJSON()).toMatchSnapshot();
});


