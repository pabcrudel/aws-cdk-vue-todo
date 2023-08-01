import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK, TodoQueryParams } from "../dynamodb-sdk";
import { ApiError } from '../api-helper';

const dbSDK: DynamodbSDK = new DynamodbSDK();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let statusCode: number;
    let body: string;

    try {
        // Check if the required body is empty
        if (event.body === null) throw new ApiError("Empty request body", 400);

        // Parse the request body to extract the ToDo item
        const requestBody = JSON.parse(event.body);
        const { id, date } = requestBody;

        // Check if the required fields are present in the request body
        if (id === undefined) throw new ApiError("The 'id' property is required in the request body", 400);
        if (!isUUID(id)) throw new ApiError("The 'id' property must be a valid uuid", 400);
        if (date === undefined) throw new ApiError("The 'date' property is required in the request body", 400);
        if (!isDate(date)) throw new ApiError("The 'date' property must be a valid date", 400);

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

function isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

function isDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}