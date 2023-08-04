import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebsiteDeploymentConstruct } from './constructs/website-deployment';
import { ToDoManagerConstruct } from './constructs/todo-manager';
import { S3ObjectStorage } from './constructs/s3-object-storage';

export class VueToDoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Deployment infrastructure
    const websiteDeployment = new WebsiteDeploymentConstruct(this, "WebsiteDeployment");

    // ToDo infrastructure
    const toDoManager = new ToDoManagerConstruct(this, "ToDoManager");

    // Store the Api url to use it in the frontend
    new S3ObjectStorage(this, "apiConnectionInfoStorage", {
      bucket: websiteDeployment.s3HostingBucket,
      key: 'config.json', // SHOULD NOT BE CHANGED
      object: {
        apiUrl: toDoManager.apiUrl
      },
    });
  };
};
