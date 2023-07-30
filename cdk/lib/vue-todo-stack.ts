import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebsiteDeploymentConstruct } from './constructs/website-deployment';

export class VueToDoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Deployment infrastructure
    const websiteDeployment = new WebsiteDeploymentConstruct(this, "WebsiteDeployment");

    // Displays Website domain name on CloudFormation output
    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      value: websiteDeployment.domainName,
      description: 'Domain name of the CloudFront distribution',
      exportName: "WebsiteDomainName"
    });
  }
}
