import path from 'path';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { AssetImage, ContainerImageConfig } from 'aws-cdk-lib/aws-ecs';
import { Code, CodeConfig } from 'aws-cdk-lib/aws-lambda';
import { PipelineStack } from '../../src/stacks/PipelineStack';


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


const websiteImageAsset = AssetImage.fromAsset(path.join(__dirname, '..', '..', 'website'), {});

test('Snapshot', () => {
  const app = new App();
  const stack = new PipelineStack(app, 'test', {
    env: {
      account: '000011112222',
      region: 'us-east-1',
    },
    connectionArn: 'arn:aws:codestar-connections:us-east-1:000011112222:connection/8db45fc6-a823-4980-b94d-a7dcf69cfe99',
    websiteImageAsset,
    replicationRoleArn: 'arn:aws:iam::000011112222:role/BucketReplication-ReplicationRoleCE149CEC-tZp8bWrelieK',
  });

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
