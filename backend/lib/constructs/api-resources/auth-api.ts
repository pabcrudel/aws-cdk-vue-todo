import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { ApiResourceProps } from './api-resource-props';

export class AuthApi extends Construct {
    constructor(scope: Construct, id: string, props: ApiResourceProps) {
        super(scope, id);

        /** API Gateway REST API root resource to handle authentication and registration functionality */
        const authApiRootResource = props.restApi.root.addResource('auth');

        const accountResource = authApiRootResource.addResource('{id}');
        [
            { name: 'register', parent: authApiRootResource },
            { name: 'login', parent: authApiRootResource },
            { name: 'recovery', parent: accountResource },
            { name: 'change-password', parent: accountResource },
            { name: 'change-username', parent: accountResource },
            { name: 'change-email', parent: accountResource },
        ]
            .forEach(resource => {
                const apiResource = resource.parent.addResource(resource.name);

                apiResource.addCorsPreflight({
                    allowOrigins: apiGateway.Cors.ALL_ORIGINS,
                    allowMethods: ['POST'],
                });

                apiResource.addMethod('POST', new apiGateway.LambdaIntegration(
                    new lambdaNode.NodejsFunction(
                        this,
                        resource.name.replace(/-([a-z])/g, (_, match) => match.toUpperCase()),
                        {
                            entry: `./lambda-functions/auth.ts`,
                            handler: resource.name,
                            runtime: lambda.Runtime.NODEJS_16_X,
                            environment: {
                                USER_POOL_ID: props.userPoolID,
                                USER_POOL_CLIENT_ID: props.userPoolClientID,
                            },
                        }
                    )
                ));
            });
    };
};