import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface ServiceAccountUsersStackProps extends StackProps {
  readonly serviceAccounts: any[];
}

export class ServiceAccountUsersStack extends Stack {
  constructor(scope: Construct, id: string, props: ServiceAccountUsersStackProps) {
    super(scope, id, props);
  }

}
