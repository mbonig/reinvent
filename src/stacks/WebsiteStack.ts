import { Duration, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { ITableV2, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { ReplicatedBucket } from '../constructs/ReplicatedBucket';
import { WebsiteStackTest } from '../constructs/WebsiteStackTest/WebsiteStackTest';

export interface WebsiteStackProps extends StackProps {
  tablePrefix: string;
  replicationRoleArn: string;
  websiteDomainName: string;
  tables: ITableV2[];
  vpc: IVpc;
}


export class WebsiteStack extends Stack {
  public mediaBucket: IBucket;

  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);
    const { vpc, tables } = props;
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', { domainName: 'matthewbonig.com' });
    const cluster = new Cluster(this, 'Cluster', {
      vpc,
    });
    const mediaBucket = this.mediaBucket = new ReplicatedBucket(this, 'MediaBucket', {
      websiteDomainName: props.websiteDomainName,
      region: this.region,
      replicationRoleArn: props.replicationRoleArn,
    });

    const regionSpecificDomainName = `${props.websiteDomainName}-${Stack.of(this).region}.matthewbonig.com`;

    const service = new ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster,
      domainName: regionSpecificDomainName,
      domainZone: hostedZone,
      certificate: new Certificate(this, 'Certificate', {
        domainName: `${props.websiteDomainName}.matthewbonig.com`,
        subjectAlternativeNames: [regionSpecificDomainName],
        validation: CertificateValidation.fromDns(hostedZone),
      }),
      redirectHTTP: true,
      healthCheckGracePeriod: Duration.minutes(3),
      desiredCount: 2,
      taskImageOptions: {
        image: ContainerImage.fromAsset('website'),
        containerPort: 3000,
        environment: {
          MEDIA_BUCKET: mediaBucket.bucketName,
        },
      },
    });

    mediaBucket.grantWrite(service.taskDefinition.taskRole, 'uploads/*');
    mediaBucket.grantRead(service.taskDefinition.taskRole, 'media/*');

    if (tables.length > 0) {
      for (const table of tables) {
        table.grantReadWriteData(service.taskDefinition.taskRole);
      }
    } else {
      // need to lookup the table
      const heroesTable = TableV2.fromTableAttributes(this, 'HeroesTable', {
        tableName: `${props.tablePrefix}-Heroes`,
      });
      heroesTable.grantReadWriteData(service.taskDefinition.taskRole);
    }

    const tests = new WebsiteStackTest(this, 'UrlPingTest', {
      url: `https:${regionSpecificDomainName}`,
    });
    tests.node.addDependency(service);

    Tags.of(this).add('role', 'website');
  }

}
