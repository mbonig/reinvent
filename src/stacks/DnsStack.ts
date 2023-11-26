import { Stack, StackProps } from 'aws-cdk-lib';
import { CfnRecordSet, CnameRecord, HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface DnsStackProps extends StackProps {
  websiteDomainName: string;
}

export class DnsStack extends Stack {
  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', { domainName: 'matthewbonig.com' });

    {
      const record = new CnameRecord(this, 'reinvent-us-east-1', {
        zone: hostedZone,
        recordName: `${props.websiteDomainName}`,
        domainName: `${props.websiteDomainName}-us-east-1.matthewbonig.com`,
      });
      const recordSet = (record.node.defaultChild as CfnRecordSet);
      recordSet.region = 'us-east-1';
      recordSet.setIdentifier = 'us-east-1';
    }
    {
      const record = new CnameRecord(this, 'reinvent-us-west-2', {
        zone: hostedZone,
        recordName: `${props.websiteDomainName}`,
        domainName: `${props.websiteDomainName}-us-west-2.matthewbonig.com`,
      });
      const recordSet = (record.node.defaultChild as CfnRecordSet);
      recordSet.region = 'us-west-2';
      recordSet.setIdentifier = 'us-west-2';
    }
  }


}
