import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebsiteResourceBuildingConstruct } from './constructs/website-resource-building';
import { ToDoManagerConstruct } from './constructs/todo-manager';

export class VueToDoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Build the resources to deploy the website
    const WebsiteResourceBuilding = new WebsiteResourceBuildingConstruct(this, "WebsiteResourceBuilding");

    // Create the resources to manage the ToDos
    const toDoManager = new ToDoManagerConstruct(this, "ToDoManager");
  };
};
