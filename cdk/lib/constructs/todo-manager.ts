import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class TodoManagerConstruct extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

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
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        /**
         * Array containing the names of Lambda functions to be created.
         * These function names will be used in the loop to create the respective Lambda functions.
         */
        const lambdaFunctionNames = [
            "GetToDosFunction",
            "GetToDoFunction",
            "PutToDoFunction",
            "DeleteToDosFunction",
        ];

        const lambdaFunctions = lambdaFunctionNames.map((lambdaFunctionName) => {
            /** Function name in hyphen-separated lowercase letters. */
            const formatedFunctionName = lambdaFunctionName.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

            /**
            * Common configuration settings for the 4 Lambda functions being created, including:
            * 
            * - Handler: The entry point function that Lambda executes.
            * - Runtime: The Node.js 16.x runtime for the Lambda functions.
            * - Environment: Environment variables to be passed to the Lambda functions.
            *   - TABLE_NAME: The name of the DynamoDB table (`todoTable`) used by the functions.
            */
            const lambdaFunction = new lambdaNode.NodejsFunction(this, lambdaFunctionName, {
                entry: `./lambda-functions/${formatedFunctionName}.ts`,
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

            return lambdaFunction;
        });
    };
};
