import { APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK } from "../dynamodb-sdk";
import { ToDoDynamoDB } from "../todo-interfaces";

const dbStore: ToDoDynamoDB = new DynamodbSDK();

exports.handler = async (): Promise<APIGatewayProxyResult> => {
    let statusCode: number;
    let body: string;

    try {
        const result = await dbStore.getToDos();

        statusCode = 200;
        body = `{"ToDos": ${JSON.stringify(result)}}`;
    }
    catch (error) {
        statusCode = 500;
        body = JSON.stringify(error);
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body
    };
};