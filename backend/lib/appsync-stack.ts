import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { CognitoAuth } from './constructs/cognito-auth';
import { DynamoDBStorage } from './constructs/dynamodb-storage';
import path = require('path');

export class AppSyncStack extends cdk.Stack {
    private readonly lambdaDataSource: cdk.aws_appsync.LambdaDataSource;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const cognitoAuth = new CognitoAuth(this, 'CognitoAuth');

        const dynamoDBStorage = new DynamoDBStorage(this, 'DynamoDBStorage');
        const dynamoDBTable = dynamoDBStorage.todoTable;

        const lambdaNodeFunction = new lambdaNode.NodejsFunction(this, 'LambdaNodeFunction', {
            entry: "./lambda-function/index.ts",
            handler: 'main',
            runtime: lambda.Runtime.NODEJS_16_X,
            environment: {
                TABLE_NAME: dynamoDBTable.tableName,
                SECOND_TABLE_NAME: dynamoDBStorage.todoUserTableName,
            },
        });
        dynamoDBTable.grantReadWriteData(lambdaNodeFunction);

        const graphQLApi = new appsync.GraphqlApi(this, 'GraphQLApi', {
            name: 'ToDosGraphQLApi',
            schema: appsync.SchemaFile.fromAsset('./graphql/index.graphql'),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.USER_POOL,
                    userPoolConfig: { userPool: cognitoAuth.userPool },
                },
            },
        });

        this.lambdaDataSource = graphQLApi.addLambdaDataSource('LambdaDataSource', lambdaNodeFunction);
        this.createQueryResolver('ListToDos');
        this.createMutationResolver('CreateToDo');
        this.createMutationResolver('UpdateToDo');
        this.createMutationResolver('DeleteToDo');
    };

    private createQueryResolver(fieldName: string) {
        this.createResolver('Query', fieldName);
    };
    private createMutationResolver(fieldName: string) {
        this.createResolver('Mutation', fieldName);
    };
    private createResolver(typeName: string, fieldName: string) {
        this.lambdaDataSource.createResolver(`${typeName}${fieldName}Resolver`, { typeName, fieldName });
    };
};