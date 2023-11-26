import { App, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ShellStep } from 'aws-cdk-lib/pipelines';
import { AwsCredentials, GitHubWorkflow } from 'cdk-pipelines-github';
import { WebsiteProps } from './PipelineStack';
import { DEV_ACCOUNT, PRIMARY_REGION, PROD_ACCOUNT, SECONDARY_REGION } from '../constants';
import { ApplicationStage } from '../stages/ApplicationStage';
import { DnsStage } from '../stages/DnsStage';

interface GithubPipelineStackProps extends StackProps {
  replicationRoleArn: string;
  githubActionRoleArn: string;
  websiteImageAsset: ContainerImage;
}

export class GitHubPipelineStack extends Stack {
  constructor(scope: App, id: string, props: GithubPipelineStackProps) {
    super(scope, id, props);
    const { websiteImageAsset } = props;

    const devWebsiteProps: WebsiteProps = {
      imageAsset: websiteImageAsset,
      websiteDomainName: 'reinvent-dev',
      replicationRoleArn: props.replicationRoleArn,
    };
    const prodWebsiteProps: WebsiteProps = {
      imageAsset: websiteImageAsset,
      websiteDomainName: 'reinvent',
      replicationRoleArn: props.replicationRoleArn,
    };

    const pipeline = new GitHubWorkflow(scope, 'Pipeline', {
      awsCreds: AwsCredentials.fromOpenIdConnect({
        gitHubActionRoleArn: props.githubActionRoleArn,
      }),
      synth: new ShellStep('Synth', {
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
      }),
    });

    const devWave = pipeline.addWave('Dev', {});

    const devPrimaryStage = new ApplicationStage(
      this,
      'DevPrimary',
      {
        env: {
          account: DEV_ACCOUNT,
          region: PRIMARY_REGION,
        },
        envTag: 'dev',
        ...devWebsiteProps,
        vpc: {
          cidr: '10.1.0.0/24',
        },
        isPrimary: true,
        tablePrefix: 'dev',
      });

    devWave.addStage(devPrimaryStage);

    const devSecondaryStage = new ApplicationStage(
      this,
      'DevSecondary',
      {
        env: {
          account: DEV_ACCOUNT,
          region: SECONDARY_REGION,
        },
        envTag: 'dev',
        ...devWebsiteProps,
        vpc: {
          cidr: '10.1.1.0/24',
        },
        isPrimary: false,
        tablePrefix: 'dev',
      });
    devWave.addStage(devSecondaryStage);

    pipeline.addStage(new DnsStage(
      this,
      'DevDns',
      {
        env: {
          account: DEV_ACCOUNT,
          region: PRIMARY_REGION,
        },
        websiteDomainName: devWebsiteProps.websiteDomainName,
      }),
    {
      post: [
        new ShellStep('Test Prod Site', {
          commands: [`curl https://${devWebsiteProps.websiteDomainName}.matthewbonig.com`],
        }),
      ],
    });

    const prodWave = pipeline.addWave('Prod', {});

    const prodPrimaryStage = new ApplicationStage(this, 'ProdPrimary', {
      env: {
        account: PROD_ACCOUNT,
        region: PRIMARY_REGION,
      },
      envTag: 'prod',
      ...prodWebsiteProps,
      vpc: {
        cidr: '10.2.0.0/24',
      },
      isPrimary: true,
      tablePrefix: 'prod',
    });

    prodWave.addStage(prodPrimaryStage, {});

    const prodSecondaryStage = new ApplicationStage(this, 'ProdSecondary', {
      env: {
        account: PROD_ACCOUNT,
        region: SECONDARY_REGION,
      },
      envTag: 'prod',
      ...prodWebsiteProps,
      vpc: {
        cidr: '10.2.1.0/24',
      },
      isPrimary: false,
      tablePrefix: 'prod',
    });

    prodWave.addStage(prodSecondaryStage, {});

    pipeline.addStage(new DnsStage(
      this,
      'ProdDns',
      {
        env: {
          account: PROD_ACCOUNT,
          region: PRIMARY_REGION,
        },
        websiteDomainName: prodWebsiteProps.websiteDomainName,
      }),
    {
      post: [
        new ShellStep('Test Dev Site', {
          commands: [`curl https://${prodWebsiteProps.websiteDomainName}.matthewbonig.com`],
        }),
      ],
    });

    pipeline.buildPipeline();

    Tags.of(prodSecondaryStage).add('test', 'test');
  }
}
