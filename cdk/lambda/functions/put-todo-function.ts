import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK } from "../dynamodb-sdk";

const dbSDK: DynamodbSDK = new DynamodbSDK();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let statusCode: number = 400;
    let body: string;

    if (event.body !== null) {
        try {
            // Parse the request body to extract the name and id of the ToDo item
            const requestBody = JSON.parse(event.body);
            const { name, id } = requestBody;

            // Check if the required fields are present in the request body
            if (name === undefined) throw new Error("The 'name' property is required in the request body");
            if (id === undefined) throw new Error("The 'id' property is required in the request body");

            // Call the putToDo method of DynamodbSDK to add the new ToDo item to the table
            await dbSDK.putToDo(name, id);

            // Return a successful response
            statusCode = 200;
            body = JSON.stringify({ message: "ToDo created" });
        } 
        catch (error) {
            // Return an error response if there was any issue adding the ToDo item
            body = JSON.stringify(error);
        };
    } 
    else {
        // Return an error response for empty request body
        body = JSON.stringify({ message: "Empty request body" });
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body,
    };
};
