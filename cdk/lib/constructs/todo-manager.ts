import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class ToDoManagerConstruct extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        /** Sort key name used in DynamoDB and as a part path of the Rest Api child resource */
        const sortKeyName: string = "id";
        /** 
         * DynamoDB table for storing ToDo items.
         * 
         * - Partition key: 'name' (String)
         * - Sort key: 'id' (String)
         * - Encryption: AWS-managed
         * - Removal policy: DESTROY (table will be deleted when the stack is deleted)
         */
        const todoTable = new dynamodb.Table(this, 'ToDo', {
            partitionKey: {
                name: 'name',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: sortKeyName,
                type: dynamodb.AttributeType.STRING
            },
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        /** Rest Api to communicate frontend with DynamoDB ToDo table */
        const todoRestApi = new apigw.RestApi(this, "ToDoRestApi");

        /**
         * Array containing the names of Lambda functions to be created.
         * These function names will be used in the loop to create the respective Lambda functions.
         */
        const lambdaFunctionNames = [
            "GetToDosFunction",
            "GetToDoFunction",
            "PutToDoFunction",
            "DeleteToDoFunction",
        ];

        /* 
        Variables to control the flow of method creation in the loop
        to ensure that the methods are created only once.
        */
        let hasRootResource: Boolean = false;
        let todoRestApiRootResource: apigw.Resource;
        let hasChildResource: Boolean = false;
        let todoRestApiChildResource: apigw.Resource;

        /** Name of the root path part of the Rest Api */
        const rootResourcePathPart: string = "todo";

        lambdaFunctionNames.map((lambdaFunctionName) => {
            /** Function name in hyphen-separated lowercase letters. */
            const formatedFunctionName = lambdaFunctionName.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

            /**
            * Configuration settings for the Lambda functions, including:
            * 
            * - Handler: The entry point function that Lambda executes.
            * - Runtime: The Node.js 16.x runtime for the Lambda functions.
            * - Environment: Environment variables to be passed to the Lambda functions.
            *   - TABLE_NAME: The name of the DynamoDB table (`todoTable`) used by the functions.
            */
            const lambdaFunction = new lambdaNode.NodejsFunction(this, lambdaFunctionName, {
                entry: `../lambda-functions/${formatedFunctionName}.ts`,
                handler: "handler",
                runtime: lambda.Runtime.NODEJS_16_X,
                environment: {
                    TABLE_NAME: todoTable.tableName,
                },
            });

            // Grant appropriate permissions to the Lambda function over the DynamoDB table.
            // - If the function name includes "get", grant read access using 'grantReadData'.
            // - Otherwise, grant write access using 'grantWriteData'.
            if (formatedFunctionName.includes("get")) todoTable.grantReadData(lambdaFunction);
            else todoTable.grantWriteData(lambdaFunction);

            /** Integrates the Lambda function with the Api Gateway */
            const apiLambdaIntegration = new apigw.LambdaIntegration(lambdaFunction);

            // Check if the root resource has been created.
            if (!hasRootResource) {
                // If the root resource hasn't been created, add it to the API Gateway.
                todoRestApiRootResource = todoRestApi.root.addResource(rootResourcePathPart);

                // Add a "GET" method to the root resource using the specified Lambda integration.
                todoRestApiRootResource.addMethod("GET", apiLambdaIntegration);

                // Set the flag to indicate that the root resource has been created.
                hasRootResource = true;
            }
            else {
                // Check if the child resource exists.
                if (!hasChildResource) {
                    // If the child resource doesn't exist, add it to the root resource.
                    todoRestApiChildResource = todoRestApiRootResource.addResource(sortKeyName);

                    // Set the flag to indicate that the child resource has been created.
                    hasChildResource = true;
                }

                // Determine the HTTP request type based on the formatted function name.
                let httpRequestType: string;
                switch (true) {
                    case formatedFunctionName.includes("put"):
                        httpRequestType = "PUT";
                        break;
                    case formatedFunctionName.includes("delete"):
                        httpRequestType = "DELETE";
                        break;
                    default:
                        httpRequestType = "GET";
                        break;
                };

                // Add the HTTP request type method to the child resource using the Lambda integration.
                todoRestApiChildResource.addMethod(httpRequestType, apiLambdaIntegration);
            };
        });

        // Displays Rest Api URL on CloudFormation output
        new cdk.CfnOutput(this, 'RestApiURL', {
            value: todoRestApi.url + rootResourcePathPart,
            description: 'Rest Api root URL ',
            exportName: "RestApiURL"
        });
    };
};
