import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AssetImage, ContainerImageConfig } from 'aws-cdk-lib/aws-ecs';
import { Code, CodeConfig } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { VideoTranscoderStack } from '../../src/stacks/VideoTranscoderStack';


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


test('VideoTranscoderStack Snapshot', () => {
  const app = new App();
  const testStack = new Stack(app, 'TestStack', {});
  const stack = new VideoTranscoderStack(app, 'test', {
    mediaBucket: new Bucket(testStack, 'MediaBucket', {}),
  });

  const assert = Template.fromStack(stack);
  expect(assert.toJSON()).toMatchSnapshot();
});
