import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebsiteDeploymentConstruct } from './constructs/website-deployment';
import { ToDoManagerConstruct } from './constructs/todo-manager';

export class VueToDoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Deployment infrastructure
    const websiteDeployment = new WebsiteDeploymentConstruct(this, "WebsiteDeployment");

    // ToDo infrastructure
    const ToDoManager = new ToDoManagerConstruct(this, "ToDoManager");
  };
};
