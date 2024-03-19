import { Arn, ArnFormat } from 'aws-cdk-lib';
import { Bucket, CfnBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface ReplicatedBucketProps {
  replicationRoleArn?: string;
  websiteDomainName: string;
  region: string;
}

export function getBucketName(bucketPrefix: string, bucketRegion: string) {
  return `${bucketPrefix}-media-${bucketRegion}`;
}

export class ReplicatedBucket extends Bucket {
  constructor(scope: Construct, id: string, props: ReplicatedBucketProps) {
    super(scope, id, {
      eventBridgeEnabled: true,
      bucketName: getBucketName(props.websiteDomainName, props.region),
      versioned: true,
    });

    const otherBucket = props.region === 'us-east-1'
      ? getBucketName(props.websiteDomainName, 'us-west-2')
      : getBucketName(props.websiteDomainName, 'us-east-1');


    if (props.replicationRoleArn) {
      // we can't pass reference across stage boundaries, so this is going to get shared via a static value
      const replicationRoleArn = props.replicationRoleArn;

      (this.node.defaultChild as CfnBucket).addPropertyOverride('ReplicationConfiguration', {
        Role: replicationRoleArn,
        Rules: [
          {
            Destination: {
              Bucket: Arn.format({
                service: 's3',
                partition: 'aws',
                account: '',
                region: '',
                resource: otherBucket,
                arnFormat: ArnFormat.NO_RESOURCE_NAME,
              }),
              StorageClass: 'STANDARD',
            },
            Id: 'ConvertedReplicationRule',
            Prefix: 'converted/',
            Status: 'Enabled',
          },
        ],
      });
    }
  }


}
