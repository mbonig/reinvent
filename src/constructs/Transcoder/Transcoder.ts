import { Arn, Stack } from 'aws-cdk-lib';
import { Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { MEDIA_CONVERT_ROLE_ARN } from './Transcoder.TriggerTranscoding';

export interface TranscoderProps {
  bucket: IBucket;
}

export class Transcoder extends Construct {
  triggerFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: TranscoderProps) {
    super(scope, id);
    const mediaConvertRole = new Role(this, 'MediaConvertRole', {
      assumedBy: new ServicePrincipal('mediaconvert.amazonaws.com'),
    });

    props.bucket.grantRead(mediaConvertRole, 'uploads/*');
    props.bucket.grantWrite(mediaConvertRole, 'converted/*');

    const triggerFunction = this.triggerFunction = new NodejsFunction(this, 'TriggerTranscoding', {
      environment: {
        [MEDIA_CONVERT_ROLE_ARN]: mediaConvertRole.roleArn,
      },
    });

    triggerFunction.addToRolePolicy(new PolicyStatement({
      resources: [`arn:aws:mediaconvert:${Stack.of(this).region}:${Stack.of(this).account}:endpoints/*`],
      actions: ['mediaconvert:DescribeEndpoints'],
      effect: Effect.ALLOW,

    }));

    triggerFunction.addToRolePolicy(new PolicyStatement({
      resources: [
        Arn.format({
          resource: 'queues',
          service: 'mediaconvert',
          resourceName: 'Default',
        }, Stack.of(this)),
      ],
      actions: ['mediaconvert:CreateJob'],
      effect: Effect.ALLOW,
    }));

    triggerFunction.addToRolePolicy(new PolicyStatement({
      resources: [mediaConvertRole.roleArn],
      actions: ['iam:PassRole'],
      effect: Effect.ALLOW,
    }));

    new Rule(this, 'SourceBucketTrigger', {
      targets: [new LambdaFunction(triggerFunction)],
      eventPattern: {
        source: ['aws.s3'],
        detailType: ['Object Created'],
        detail: {
          bucket: {
            name: [props.bucket.bucketName],
          },
          object: {
            key: [{ prefix: 'uploads/' }],
          },
        },
      },
    });
  }
}
