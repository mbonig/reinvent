import { Stack, StackProps } from 'aws-cdk-lib';
import { IpAddresses, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface VpcStackProps extends StackProps {
  cidr: string;
}

export class VpcStack extends Stack {
  public vpc: Vpc;
  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);
    this.vpc = new Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
      ipAddresses: IpAddresses.cidr(props.cidr),
    });
  }

}
