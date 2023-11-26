import * as fs from 'fs';
import path from 'path';
import { StateMachine } from '@matthewbonig/state-machine';
import { IntrinsicValidator, Validation } from '@wheatstalk/cdk-intrinsic-validator';
import { Duration } from 'aws-cdk-lib';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';


interface VideoTranscodingStackTestProps {
  bucket: IBucket;
}

export class TranscoderTests extends Construct {
  constructor(scope: Construct, id: string, props: VideoTranscodingStackTestProps) {
    super(scope, id);

    new BucketDeployment(this, 'TestFileDeployment', {
      sources: [Source.asset(path.join(__dirname, 'test.zip'))],
      destinationBucket: props.bucket,
      destinationKeyPrefix: 'test/',
    });
    const testFile = 'test.mp4';
    const convertedFileKey = `converted/${testFile}`;
    const uploadedFileKey = `uploads/${testFile}`;
    const sourceFileKey = `test/${testFile}`;

    const stateMachine = new StateMachine(this, 'TestingMachine', {
      definition: JSON.parse(fs.readFileSync(path.join(__dirname, 'testing-workflow.json'), 'utf-8')),
      timeout: Duration.minutes(1),
      overrides: {
        CopyObject: {
          Parameters: {
            Bucket: props.bucket.bucketName,
            CopySource: `${props.bucket.bucketName}/test/${testFile}`,
            Key: uploadedFileKey,
          },
        },
        GetObjectAttributes: {
          Parameters: {
            Bucket: props.bucket.bucketName,
            Key: convertedFileKey,
          },
        },
        DeleteObjects: {
          Parameters: {
            Bucket: props.bucket.bucketName,
            Delete: {
              Objects: [
                { Key: convertedFileKey },
                { Key: uploadedFileKey },
              ],
            },
          },
        },
      },
    });

    // permissions to copy file over to start the test
    props.bucket.grantRead(stateMachine, sourceFileKey);
    props.bucket.grantWrite(stateMachine, uploadedFileKey);

    // permission to check the status of the existing file.
    props.bucket.grantRead(stateMachine, convertedFileKey);

    // permissions to cleanup
    props.bucket.grantDelete(stateMachine, uploadedFileKey);
    props.bucket.grantDelete(stateMachine, convertedFileKey);

    new IntrinsicValidator(this, 'Tests', {
      validations: [
        Validation.stateMachineExecutionSucceeds({
          stateMachine,
        }),
      ],
    });
  }

}
