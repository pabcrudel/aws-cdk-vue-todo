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
        const { id, date } = requestBody;

        // Check if the required fields are present in the request body
        if (id === undefined) throw new Error("The 'id' property is required in the request body");
        if (date === undefined) throw new Error("The 'date' property is required in the request body");

        // Call the deleteToDo method of DynamodbSDK to add the new ToDo item to the table
        await dbSDK.deleteToDo(id, date);

        // Return a successful response
        statusCode = 200;
        body = JSON.stringify({ message: "ToDo deleted" });
    } 
    catch (error) {
        // Return an error response if there was any issue adding the ToDo item
        body = JSON.stringify(error);
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body
    };
};