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

        // Iterating over an array of method objects to create API Gateway methods for each one
        [
            { name: 'ListToDos', httpMethod: 'GET' },
            { name: 'CreateToDo', httpMethod: 'PUT' },
            { name: 'UpdateToDo', httpMethod: 'POST' },
            { name: 'DeleteToDo', httpMethod: 'DELETE' },
        ]
            .forEach(resource => {
                const lambdaFunction = new lambdaNode.NodejsFunction(
                    this,
                    resource.name,
                    {
                        entry: `./lambda-functions/crud.ts`,
                        handler: resource.name.replace(/^./, (match) => match.toLowerCase()), // = listToDos / updateToDo,
                        runtime: lambda.Runtime.NODEJS_16_X,
                        environment: {
                            TABLE_NAME: props.todoTable.tableName,
                            SECONDARY_TABLE_NAME: props.todoUserTableName,
                        },
                    }
                );

                // Adding a http method, a Lambda Integration and a Cognito Authorizer
                crudApiRootResource.addMethod(
                    resource.httpMethod,
                    new apiGateway.LambdaIntegration(lambdaFunction),
                    {
                        authorizationType: apiGateway.AuthorizationType.COGNITO,
                        authorizer: auth
                    }
                );
            });
    };
};