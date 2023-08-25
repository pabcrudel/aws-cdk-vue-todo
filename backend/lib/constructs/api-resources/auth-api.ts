import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { AuthResponseProps } from './api-resource-props';

export class AuthApi extends Construct {
    constructor(scope: Construct, id: string, props: AuthResponseProps) {
        super(scope, id);

        /** API Gateway REST API root resource to handle authentication and registration functionality */
        const authApiRootResource = props.restApi.root.addResource('auth');

        /** Child resource to filter by user id */
        const accountResource = authApiRootResource.addResource('{id}');

        // Iterating over an array of resource objects to create API Gateway child resources for each one
        [
            { name: 'register', parent: authApiRootResource },
            { name: 'login', parent: authApiRootResource },
            { name: 'recovery', parent: accountResource },
            { name: 'change-password', parent: accountResource },
            { name: 'change-username', parent: accountResource },
            { name: 'change-email', parent: accountResource },
        ]
            .forEach(resource => {
                /** Create a child resource under the parent resource in the API Gateway */
                const apiResource = resource.parent.addResource(resource.name);
                
                // Add a CORS preflight OPTIONS
                apiResource.addCorsPreflight({
                    allowOrigins: apiGateway.Cors.ALL_ORIGINS,
                    allowMethods: ['POST'],
                });

                // Adding a POST method and a Lambda Integration
                apiResource.addMethod('POST', new apiGateway.LambdaIntegration(
                    new lambdaNode.NodejsFunction(
                        this,
                        resource.name.replace(/-([a-z])/g, (_, match) => match.toUpperCase()), // = Register / ChangePassword
                        {
                            entry: `./lambda-functions/auth.ts`,
                            handler: resource.name.replace(/-([a-z])/g, (_, match) => match), // = Login / changeUsername
                            runtime: lambda.Runtime.NODEJS_16_X,
                            environment: {
                                USER_POOL_ID: props.userPool.userPoolId,
                                USER_POOL_CLIENT_ID: props.userPoolClientID,
                                USER_POOL_REGION: props.userPoolRegion,
                            },
                        }
                    )
                ));
            });
    };
};