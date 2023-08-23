import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CognitoAuth } from './constructs/cognito-auth';
import { DynamoDBStorage } from './constructs/dynamodb-storage';

export class AppSyncStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const cognitoAuth = new CognitoAuth(this, 'CognitoAuth');

        const dynamoDBStorage = new DynamoDBStorage(this, 'DynamoDBStorage');
    };
};