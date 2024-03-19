import { Stage, StageProps, Tags } from 'aws-cdk-lib';
import { ITableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { ManualApprovalStep, StackSteps } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { PRIMARY_REGION } from '../constants';
import { CdnStack } from '../stacks/CdnStack';
import { DatabaseStack, DatabaseStackProps } from '../stacks/DatabaseStack';
import { VideoTranscoderStack } from '../stacks/VideoTranscoderStack';
import { VpcStack, VpcStackProps } from '../stacks/VpcStack';
import { WebsiteStack, WebsiteStackProps } from '../stacks/WebsiteStack';

interface MyApplicationStageProps extends StageProps, DatabaseStackProps, Omit<WebsiteStackProps, 'tables' | 'vpc' | 'setupReplication'> {

  vpc: VpcStackProps;
  envTag: string;
}

export class ApplicationStage extends Stage {
  stackSteps: StackSteps[] = [];

  constructor(scope: Construct, id: string, props: MyApplicationStageProps) {
    super(scope, id, props);

    const vpcStack = new VpcStack(this, 'Vpc', { ...props, ...props.vpc });

    let tables: ITableV2[] = [];
    if (props.env?.region === PRIMARY_REGION) {
      const database = new DatabaseStack(this, 'Database', {
        ...props,
        tablePrefix: props.tablePrefix,
      });
      this.stackSteps.push({
        stack: database,
        changeSet: [
          new ManualApprovalStep('ChangesetApproval', {
            comment: 'Please review the changesets',
          }),
        ],
      });
      tables = database.tables;
    }

    const website = new WebsiteStack(this, 'Website', {
      tables: tables,
      ...props,
      vpc: vpcStack.vpc,
    });

    new CdnStack(this, 'CDN', {
      websiteLoadBalancer: website.loadBalancer,
      certificate: website.certificate,
      ...props,
    });

    new VideoTranscoderStack(this, 'MediaTranscoder', {
      mediaBucket: website.mediaBucket,
      ...props,
    });

    Tags.of(this).add('env', props.envTag);

  }

}
