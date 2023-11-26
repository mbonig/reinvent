import path from 'path';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AssetImage, ContainerImageConfig } from 'aws-cdk-lib/aws-ecs';
import { Code, CodeConfig } from 'aws-cdk-lib/aws-lambda';
import { GitHubPipelineStack } from '../../src/stacks/GitHubPipelineStack';

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


test('GitHubPipelineStack Snapshot', () => {
  const websiteImageAsset = AssetImage.fromAsset(path.join(__dirname, '..', '..', 'website'));

  const app = new App();
  const stack = new GitHubPipelineStack(app, 'test', {
    replicationRoleArn: 'arn:aws:iam::000011112222:role/test-replication-role',
    websiteImageAsset: websiteImageAsset,
    githubActionRoleArn: 'arn:aws:iam::000011112222:role/test-github-action-role',
  });

  const assert = Template.fromStack(stack);
  expect(assert.toJSON()).toMatchSnapshot();
});
