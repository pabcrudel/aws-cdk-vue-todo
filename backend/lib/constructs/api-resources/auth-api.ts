import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { ApiResourceProps } from './api-resource-props';

export class AuthApi extends Construct {
    constructor(scope: Construct, id: string, props: ApiResourceProps) {
        super(scope, id);

        // Using object destructuring to extract the properties from the Construct props
        const { restApi } = props;

        /** API Gateway REST API root resource to handle authentication and registration functionality */
        const authApiResource = restApi.root.addResource('auth');
    };
};