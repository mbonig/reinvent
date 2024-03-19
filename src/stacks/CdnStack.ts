import { Stack, StackProps } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  Distribution,
  OriginProtocolPolicy,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { LoadBalancerV2Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ILoadBalancerV2 } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

interface CDNStackProps extends StackProps {
  websiteDomainName: string;
  certificate: ICertificate;
  websiteLoadBalancer: ILoadBalancerV2;
}

export class CdnStack extends Stack {
  constructor(scope: Construct, id: string, props: CDNStackProps) {
    super(scope, id, props);

    const fqdn = `${props.websiteDomainName}.matthewbonig.com`;
    const originRequestPolicy = new OriginRequestPolicy(this, 'OriginRequestPolicy', {
      headerBehavior: {
        behavior: 'allViewer',
      },
    });
    new Distribution(this, 'Resource', {
      defaultBehavior: {
        origin: new LoadBalancerV2Origin(props.websiteLoadBalancer, {
          protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
        }),
        originRequestPolicy: {
          originRequestPolicyId: originRequestPolicy.originRequestPolicyId,
        },
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      certificate: props.certificate,
      domainNames: [fqdn],
    });
  }

}
