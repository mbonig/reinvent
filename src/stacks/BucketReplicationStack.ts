import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { S3 } from 'cdk-iam-floyd';
import { Construct } from 'constructs';

export interface BucketReplicationStackProps extends StackProps {
  buckets: string[];
}

export class BucketReplicationStack extends Stack {
  replicationRole: Role;

  constructor(scope: Construct, id: string, props: BucketReplicationStackProps) {
    super(scope, id, props);

    const replicationRole = this.replicationRole = new Role(this, 'ReplicationRole', {
      assumedBy: new ServicePrincipal('s3.amazonaws.com'),
    });

    let toList = new S3().toGetReplicationConfiguration().toListBucket();
    let toReplicate = new S3().toReplicateObject().toReplicateObject();
    let toGetObjectVersion = new S3().toGetObjectVersion().toGetObjectVersionAcl();

    for (const bucket of props.buckets) {
      toList.onBucket(bucket);
      toReplicate.onObject(bucket, 'converted/*');
      toGetObjectVersion.onObject(bucket, 'converted/*');
    }

    replicationRole.addToPolicy(toReplicate);
    replicationRole.addToPolicy(toList);
    replicationRole.addToPolicy(toGetObjectVersion);

    // we can't pass reference across stage boundaries, so this is going to get shared via a static string...
    new CfnOutput(this, 'ReplicationRoleArn', {
      value: replicationRole.roleArn,
    });
  }
}
