// src/BucketReplication.ts
import { App } from 'aws-cdk-lib';
import { DEV_ACCOUNT, PRIMARY_REGION, SECONDARY_REGION } from './constants';
import { getBucketName } from './constructs/ReplicatedBucket';
import { BucketReplicationStack } from './stacks/BucketReplicationStack';

const app = new App();

new BucketReplicationStack(app, 'BucketReplication', {
  env: {
    account: DEV_ACCOUNT,
    region: PRIMARY_REGION,
  },
  buckets: [
    getBucketName('reinvent-dev', PRIMARY_REGION),
    getBucketName('reinvent-dev', SECONDARY_REGION),
    getBucketName('reinvent', PRIMARY_REGION),
    getBucketName('reinvent', SECONDARY_REGION),
  ],
});

app.synth();
