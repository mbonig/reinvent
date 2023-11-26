import { Stage, StageProps } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { BucketReplicationStack, BucketReplicationStackProps } from '../stacks/BucketReplicationStack';

interface BucketReplicationStageProps extends StageProps, BucketReplicationStackProps {
}

export class BucketReplicationStage extends Stage {
  replicationRole: Role;

  constructor(scope: Construct, id: string, props: BucketReplicationStageProps) {
    super(scope, id, props);
    const replicationStack = new BucketReplicationStack(this, 'Replication', props);
    this.replicationRole = replicationStack.replicationRole;
  }
}
