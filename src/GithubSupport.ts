// src/GithubSupport.ts
import { App } from 'aws-cdk-lib';
import { DEV_ACCOUNT, PRIMARY_REGION, PROD_ACCOUNT } from './constants';
import { GitHubSupportStack } from './stacks/GitHubSupportStack';

const app = new App();

new GitHubSupportStack(app, 'DevGithubSupport', {
  env: {
    account: DEV_ACCOUNT,
    region: PRIMARY_REGION,
  },
});
new GitHubSupportStack(app, 'ProdGithubSupport', {
  env: {
    account: PROD_ACCOUNT,
    region: PRIMARY_REGION,
  },
});
app.synth();


