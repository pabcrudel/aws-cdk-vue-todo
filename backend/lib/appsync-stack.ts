import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { CognitoAuth } from './constructs/cognito-auth';
import { DynamoDBStorage } from './constructs/dynamodb-storage';

export class AppSyncStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const cognitoAuth = new CognitoAuth(this, 'CognitoAuth');

        const dynamoDBStorage = new DynamoDBStorage(this, 'DynamoDBStorage');
        const dynamoDBTableName = dynamoDBStorage.todoTable.tableName;

        const lambdaFunction = new lambdaNode.NodejsFunction(this, 'LambdaFunction', {
            entry: "./lambda-function/index.ts",
            handler: 'main',
            runtime: lambda.Runtime.NODEJS_16_X,
            environment: {
                TABLE_NAME: dynamoDBTableName,
                SECOND_TABLE_NAME: dynamoDBStorage.todoUserTableName,
            },
        });
    };
};