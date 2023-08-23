import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { CognitoAuth } from './constructs/cognito-auth';
import { DynamoDBStorage } from './constructs/dynamodb-storage';
import path = require('path');

export class appsyncStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const cognitoAuth = new CognitoAuth(this, 'CognitoAuth');

        const dynamoDBStorage = new DynamoDBStorage(this, 'DynamoDBStorage');
        const dynamoDBTableName = dynamoDBStorage.todoTable.tableName;

        const lambdaNodeFunction = new lambdaNode.NodejsFunction(this, 'LambdaNodeFunction', {
            entry: "./lambda-function/index.ts",
            handler: 'main',
            runtime: lambda.Runtime.NODEJS_16_X,
            environment: {
                TABLE_NAME: dynamoDBTableName,
                SECOND_TABLE_NAME: dynamoDBStorage.todoUserTableName,
            },
        });

        const graphQLApi = new appsync.GraphqlApi(this, 'GraphQLApi', {
            name: 'ToDosGraphQLApi',
            schema: appsync.SchemaFile.fromAsset(path.join(__dirname, 'schema.graphql')),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.USER_POOL,
                    userPoolConfig: { userPool: cognitoAuth.userPool },
                },
            },
        });
    };
};