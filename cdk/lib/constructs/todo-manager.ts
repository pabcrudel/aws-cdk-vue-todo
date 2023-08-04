import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

let tableName: string;

export class ToDoManagerConstruct extends Construct {
    /** The deployed root URL of the ToDo REST API */
    readonly apiUrl: string;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        /** 
         * DynamoDB table for storing ToDo items.
         * 
         * - Partition key: 'name' (String)
         * - Sort key: 'id' (String)
         * - Encryption: AWS-managed
         * - Removal policy: DESTROY (table will be deleted when the stack is deleted)
         */
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
        const todoRestApi = new apigw.RestApi(this, "ToDoRestApi");

        // Store Api Url
        this.apiUrl = todoRestApi.url;

        // Lambda functions
        const getAllToDos = this.createLambdaFunction("GetAllTodos");
        const getToDo = this.createLambdaFunction("GetTodo");
        const postToDo = this.createLambdaFunction("PostTodo");
        const putToDo = this.createLambdaFunction("PutTodo");
        const deleteToDo = this.createLambdaFunction("DeleteTodo");

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
    };

    /**
    * Configuration settings for the Lambda functions, including:
    * 
    * - Handler: The entry point function that Lambda executes.
    * - Runtime: The Node.js 16.x runtime for the Lambda functions.
    * - Environment: Environment variables to be passed to the Lambda functions.
    *   - TABLE_NAME: The name of the DynamoDB table (`todoTable`) used by the functions.
    */
    private createLambdaFunction(lambdaFunctionName: string): lambdaNode.NodejsFunction {
        const formatedFunctionName = lambdaFunctionName.replace(/^./, (match) => match.toLowerCase());

        const lambdaFunction = new lambdaNode.NodejsFunction(this, lambdaFunctionName, {
            entry: `./src/lambda-function.ts`,
            handler: formatedFunctionName,
            runtime: lambda.Runtime.NODEJS_16_X,
            environment: {TABLE_NAME: tableName},
        });

        return lambdaFunction;
    };
};
