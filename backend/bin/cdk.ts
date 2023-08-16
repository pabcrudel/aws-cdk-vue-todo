#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VueToDoStack } from '../lib/vue-todo-stack';

const tag = process.env.BRANCH_NAME || '';
const stackName =  tag + '-' + 'VueToDoStack';

const app = new cdk.App();
new VueToDoStack(app, stackName);