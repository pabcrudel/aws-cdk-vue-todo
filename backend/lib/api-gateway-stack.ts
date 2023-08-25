import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { CognitoAuth } from './constructs/cognito-auth';
import { DynamoDBStorage } from './constructs/dynamodb-storage';
import { AuthApi } from './constructs/api-resources/auth-api';
import { CRUDApi } from './constructs/api-resources/crud-api';

export class ApiGatewayStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const { userPool, userPoolClient } = new CognitoAuth(this, 'CognitoAuth');

        const { todoTable, todoUserTableName } = new DynamoDBStorage(this, 'DynamoDBStorage');

        /** Rest Api to communicate frontend with the backend */
        const restApi = new apiGateway.RestApi(this, "RestApi", {
            deploy: true,
        });

        new AuthApi(this, 'AuthApiResource', {
            restApi,
            userPool,
            userPoolClientID: userPoolClient.userPoolClientId,
            userPoolRegion: this.region,
        });

        new CRUDApi(this, 'CRUDApiResource', {
            restApi,
            userPool,
            userPoolClientID: userPoolClient.userPoolClientId,
            todoTable,
            todoUserTableName
        });
    };
};