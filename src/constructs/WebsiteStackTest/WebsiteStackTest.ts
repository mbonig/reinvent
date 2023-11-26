import { Duration } from 'aws-cdk-lib';
import { InvocationType, Trigger } from 'aws-cdk-lib/triggers';
import { Construct } from 'constructs';
import { WebsiteStackTestFunction } from './WebsiteStackTest-function';
import { URL } from './WebsiteStackTest.lambda';
export interface WebsiteStackTestProps {
  url: string;
}

export class WebsiteStackTest extends Construct {
  constructor(scope: Construct, id: string, props: WebsiteStackTestProps) {
    super(scope, id);

    const testFunction = new WebsiteStackTestFunction(this, 'WebsiteStackTestFunction', {
      environment: {
        [URL]: props.url,
      },
    });

    new Trigger(this, 'Resource', {
      handler: testFunction,
      timeout: Duration.minutes(10),
      invocationType: InvocationType.REQUEST_RESPONSE,
    });
  }
}
