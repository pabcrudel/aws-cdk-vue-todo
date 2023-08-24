import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { CRUDResourceProps } from './api-resource-props';

export class CRUDApi extends Construct {
    constructor(scope: Construct, id: string, props: CRUDResourceProps) {
        super(scope, id);

        /** API Gateway REST API root resource to handle CRUD functionality */
        const crudApiRootResource = props.restApi.root.addResource('crud');

        /** Cognito User Pools authorizer for theses Api Resources */
        const auth = new apiGateway.CognitoUserPoolsAuthorizer(this, 'CRUDAuthorizer', {
            cognitoUserPools: [props.userPool]
        });
    };
};