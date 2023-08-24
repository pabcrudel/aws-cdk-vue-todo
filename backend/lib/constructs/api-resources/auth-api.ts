import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { IUserPool, IUserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { ApiResourceProps } from './api-resource-props';

export class AuthApi extends Construct {
    private readonly userPool: IUserPool;
    private readonly userPoolClient: IUserPoolClient;

    constructor(scope: Construct, id: string, props: ApiResourceProps) {
        super(scope, id);

        this.userPool = props.userPool;
        this.userPoolClient = props.userPoolClient;

        /** API Gateway REST API root resource to handle authentication and registration functionality */
        const authApiRootResource = props.restApi.root.addResource('auth');

        const accountResource = authApiRootResource.addResource('{id}');

        const postResources = [
            authApiRootResource.addResource('register'),
            authApiRootResource.addResource('login'),
            accountResource.addResource('recovery'),
            accountResource.addResource('change-password'),
            accountResource.addResource('change-username'),
            accountResource.addResource('change-email'),
        ];
    };
};