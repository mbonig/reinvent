import { App } from 'aws-cdk-lib';
import { CONNECTION_ARN, MANAGEMENT_ACCOUNT, PRIMARY_REGION } from './constants';
import { PipelineStack } from './stacks/PipelineStack';

const app = new App();


new PipelineStack(app, 'Reinvent', {
  env: {
    account: MANAGEMENT_ACCOUNT,
    region: PRIMARY_REGION,
  },
  connectionArn: CONNECTION_ARN,
  replicationRoleArn: 'arn:aws:iam::536309290949:role/BucketReplication-ReplicationRoleCE149CEC-tZp8bWrelieK',
});

// Aspects.of(app).add(new AwsSolutionsChecks());

/*
new GithubPipelineStack(app, 'Reinvent', {
  env: {
    account: MANAGEMENT_ACCOUNT,
    region: PRIMARY_REGION,
  },
  websiteImageAsset,
  githubActionRoleArn: 'arn:aws:iam::536309290949:role/DevGithubSupport-UploadRole66CFAE20-ZUP5RUPPWFC0',
});
*/

app.synth();


/*

const app = new App({
  defaultStackSynthesizer: new HeroesSynthesizer({ path: './website/pages/resources' }),
});

 */
