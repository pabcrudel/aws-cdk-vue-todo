import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { LambdaNodeFunction } from './lambda-function';
import { Construct } from 'constructs';
import { CRUDResourceProps } from './api-resource-props';

export class CRUDApi extends Construct {
    constructor(scope: Construct, id: string, props: CRUDResourceProps) {
        super(scope, id);

        /** API Gateway REST API root resource to handle CRUD functionality */
        const crudApiRootResource = props.restApi.root.addResource('crud');

        // Add a CORS preflight OPTIONS
        crudApiRootResource.addCorsPreflight({
            allowOrigins: apiGateway.Cors.ALL_ORIGINS,
            allowMethods: ['GET', 'PUT', 'POST', 'DELETE'],
        });

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
                // Adding a http method, a Lambda Integration and a Cognito Authorizer
                crudApiRootResource.addMethod(
                    resource.httpMethod,
                    new apiGateway.LambdaIntegration(
                        new LambdaNodeFunction(this, resource.name,
                            'crud',
                            resource.name.replace(/^./, (match) => match.toLowerCase()), // = listToDos / updateToDo,
                            { TABLE_NAME: props.todoTable.tableName, SECONDARY_TABLE_NAME: props.todoUserTableName, }
                        )
                    ),
                    {
                        authorizationType: apiGateway.AuthorizationType.COGNITO,
                        authorizer: auth
                    }
                );
            });
    };
};