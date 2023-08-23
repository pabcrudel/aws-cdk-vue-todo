#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
// import { VueToDoStack } from '../lib/vue-todo-stack';
import { AppSyncStack } from '../lib/appsync-stack';

let projectName = 'VueToDoStack';

const tag = process.env.BRANCH_NAME;

if (tag !== undefined) projectName =  tag + '-' + projectName;

const app = new cdk.App();
// new VueToDoStack(app, projectName);
new AppSyncStack(app, projectName);
