import { APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK } from "../dynamodb-sdk";
import { ApiError } from '../api-helper';

const dbSDK: DynamodbSDK = new DynamodbSDK();

export async function handler(): Promise<APIGatewayProxyResult> {
    let statusCode: number;
    let body: string;

    try {
        // Parse the request body to extract all the ToDos
        const result = await dbSDK.getAllToDos();

        if (result.Items === undefined || result.Items.length === 0) throw new ApiError("ToDo table is empty", 404);

        // Return a successful response
        statusCode = 200;
        body = JSON.stringify({ items: dbSDK.parseItems(result.Items) });
    }
    catch (error) {
        if (error instanceof ApiError) {
            statusCode = error.statusCode;
            body = JSON.stringify({ error: error.message });
        } else {
            statusCode = 500;
            body = JSON.stringify({ error: "Unknown error occurred" });
        };
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body
    };
};