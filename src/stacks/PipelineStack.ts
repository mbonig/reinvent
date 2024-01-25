import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { CodePipeline, CodePipelineSource, DockerCredential, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { DEV_ACCOUNT, PRIMARY_REGION, PROD_ACCOUNT, SECONDARY_REGION } from '../constants';
import { ApplicationStage } from '../stages/ApplicationStage';
import { DnsStage } from '../stages/DnsStage';

interface PipelineStackProps extends StackProps {
  replicationRoleArn: string;
  connectionArn: string;
}

export type WebsiteProps = {
  websiteDomainName: string;
  replicationRoleArn: string;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const devWebsiteProps: WebsiteProps = {
      websiteDomainName: 'reinvent-dev',
      replicationRoleArn: props.replicationRoleArn,
    };
    const prodWebsiteProps: WebsiteProps = {
      websiteDomainName: 'reinvent',
      replicationRoleArn: props.replicationRoleArn,
    };

    const pipeline = new CodePipeline(this, 'Pipeline', {
      crossAccountKeys: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection('mbonig/reinvent', 'main', {
          connectionArn: props.connectionArn,
        }),
        commands: [
          'yarn',
          'yarn build',
          'npx cdk synth',
        ],
      }),
      dockerCredentials: [
        DockerCredential.dockerHub(new Secret(this, 'DockerHub', {})),
      ],
    });

    this.createDevWave(pipeline, devWebsiteProps);
    this.createProdWave(pipeline, prodWebsiteProps);
  }

  private createProdWave(pipeline: CodePipeline, prodWebsiteProps: WebsiteProps) {
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

    prodWave.addStage(prodPrimaryStage, {
      stackSteps: prodPrimaryStage.stackSteps,
    });

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

    prodWave.addStage(prodSecondaryStage, {
      stackSteps: prodSecondaryStage.stackSteps,
    });

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
        new ShellStep('Test Prod Site', {
          commands: [`curl https://${prodWebsiteProps.websiteDomainName}.matthewbonig.com`],
        }),
      ],
    });
    return prodSecondaryStage;
  }

  private createDevWave(pipeline: CodePipeline, devWebsiteProps: WebsiteProps) {
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
  }
}
