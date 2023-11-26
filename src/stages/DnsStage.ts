import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DnsStack, DnsStackProps } from '../stacks/DnsStack';

interface DnsStageProps extends StageProps, DnsStackProps {}

export class DnsStage extends Stage {
  constructor(scope: Construct, id: string, props: DnsStageProps) {
    super(scope, id, props);
    new DnsStack(this, 'Distribution', { ...props });
  }
}
