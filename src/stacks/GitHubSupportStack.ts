import { GithubActionsIdentityProvider, GithubActionsRole } from 'aws-cdk-github-oidc';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface GithubSupportProps extends StackProps {
}

export class GitHubSupportStack extends Stack {
  constructor(scope: Construct, id: string, props: GithubSupportProps) {
    super(scope, id, props);

    const provider = GithubActionsIdentityProvider.fromAccount(
      this,
      'GithubProvider',
    );

    const deployRole = new GithubActionsRole(this, 'UploadRole', {
      provider: provider,
      owner: 'mbonig',
      repo: 'reinvent',
    });
    deployRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

    new CfnOutput(this, 'DeployRole', {
      value: deployRole.roleArn,
    });
  }
}
