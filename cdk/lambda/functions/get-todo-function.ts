import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK } from "../dynamodb-sdk";

const dbSDK: DynamodbSDK = new DynamodbSDK();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let statusCode: number = 400;
    let body: string;

    try {
        // Check if the required body is empty
        if (event.body === null) throw new Error("Empty request body");

        // Parse the request body to extract the ToDo item
        const requestBody = JSON.parse(event.body);

        // Check if the required fields are present in the request body
        if (requestBody.id === undefined) throw new Error("The 'id' property is required in the request body");

        // Call the getToDoById method of DynamodbSDK to get a ToDo item to the table
        const result = await dbSDK.getTodoById(requestBody.id);

        // Return a successful response
        statusCode = 200;
        body = JSON.stringify(result);
    } 
    catch (error) {
        // Return an error response if there was any issue getting the ToDo item
        body = JSON.stringify(error);
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body
    };
};