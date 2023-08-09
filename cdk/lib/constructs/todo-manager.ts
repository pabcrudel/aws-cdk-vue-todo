import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

let tableName: string;

export class ToDoManagerConstruct extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        /** DynamoDB table for storing ToDo items. */
        const todoTable = new dynamodb.Table(this, 'ToDoTable', {
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'date',
                type: dynamodb.AttributeType.STRING
            },
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        tableName = todoTable.tableName;

        /** Rest Api to communicate frontend with DynamoDB ToDo table */
        const todoRestApi = new apigw.RestApi(this, "ToDoRestApi", {
            defaultCorsPreflightOptions: {
                allowOrigins: apigw.Cors.ALL_ORIGINS,
            },
            deploy: true,
        });

        /** API usage plan that limits the requests per minute, with an initial burst of requests */
        const usagePlan = todoRestApi.addUsagePlan('UsagePlan', {
            throttle: {
                burstLimit: 20,  // burst requests before apply rateLimit
                rateLimit: 100, // requests per minute
            },
        });
        // Adds the usage plan to the deployment stage of the Api
        usagePlan.addApiStage({ stage: todoRestApi.deploymentStage });

        // Lambda functions
        const getAllToDos = this.createLambdaFunction("GetAllToDos");
        const getToDo = this.createLambdaFunction("GetToDo");
        const postToDo = this.createLambdaFunction("PostToDo");
        const putToDo = this.createLambdaFunction("PutToDo");
        const deleteToDo = this.createLambdaFunction("DeleteToDo");

        // Grant appropriate permissions to the Lambda function over the DynamoDB table.
        todoTable.grantReadData(getAllToDos);
        todoTable.grantReadData(getToDo);
        todoTable.grantWriteData(postToDo);
        todoTable.grantWriteData(putToDo);
        todoTable.grantWriteData(deleteToDo);

        // Add the HTTP request type method to the root resource using the Lambda integration.
        todoRestApi.root.addMethod("GET", new apigw.LambdaIntegration(getAllToDos));
        todoRestApi.root.addMethod("POST", new apigw.LambdaIntegration(postToDo));
        todoRestApi.root.addMethod("PUT", new apigw.LambdaIntegration(putToDo));
        todoRestApi.root.addMethod("DELETE", new apigw.LambdaIntegration(deleteToDo));

        // Add a "GET" method to the child resource using the specified Lambda integration.
        const todoRestApiChildResource = todoRestApi.root.addResource('filter');
        todoRestApiChildResource.addMethod("GET", new apigw.LambdaIntegration(getToDo));

        /** Allow OPTIONS request without restrictions */
        const optionsMethods = todoRestApi.methods.filter(method => method.httpMethod === 'OPTIONS')
        optionsMethods.forEach(method => {
            const cfnMethod = method.node.defaultChild as apigw.CfnMethod
            cfnMethod.addPropertyOverride('ApiKeyRequired', false)
            cfnMethod.addPropertyOverride('AuthorizationType', 'NONE')
            cfnMethod.addPropertyDeletionOverride('AuthorizerId')
        });
    };

    /** Configuration settings for the Lambda functions. */
    private createLambdaFunction(lambdaFunctionName: string): lambdaNode.NodejsFunction {
        const formattedFunctionName = lambdaFunctionName.replace(/^./, (match) => match.toLowerCase());

        const lambdaFunction = new lambdaNode.NodejsFunction(this, lambdaFunctionName, {
            entry: `./src/lambda-function.ts`,
            handler: formattedFunctionName,
            runtime: lambda.Runtime.NODEJS_16_X,
            environment: { TABLE_NAME: tableName },
            timeout: cdk.Duration.seconds(60),
        });

        return lambdaFunction;
    };
};
