import { APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK } from "../dynamodb-sdk";

const dbSDK: DynamodbSDK = new DynamodbSDK();

export async function handler(): Promise<APIGatewayProxyResult> {
    let statusCode: number;
    let body: string;

    try {
        // Parse the request body to extract all the ToDos
        const result = await dbSDK.getToDos();

        // Return a successful response
        statusCode = 200;
        body = `{"ToDos": ${JSON.stringify(result)}}`;
    }
    catch (error) {
        // Return an error response if there was any issue adding the ToDo item
        statusCode = 500;
        body = JSON.stringify(error);
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body
    };
};