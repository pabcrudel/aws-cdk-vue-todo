import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK, TodoQueryParams } from "../dynamodb-sdk";

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
        if (!isUUID(id)) throw new Error("The 'id' property must be a valid uuid");
        if (date === undefined) throw new Error("The 'date' property is required in the request body");
        if (!isUUID(id)) throw new Error("The 'id' property must be a valid uuid");

        // Call the deleteToDo method of DynamodbSDK to delete a ToDo item from the table
        const todo: TodoQueryParams = {
            id,
            date: new Date(date)
        };
        await dbSDK.deleteToDo(todo);

        // Return a successful response
        statusCode = 200;
        body = JSON.stringify({ message: "ToDo deleted" });
    } 
    catch (error) {
        // Return an error response if there was any issue adding the ToDo item
        body = JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" });
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body
    };
};

function isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

function isDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
};