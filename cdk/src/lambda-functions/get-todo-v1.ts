import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK, TodoQueryParams } from "../dynamodb-sdk-v1";
import { ApiError } from '../api-helper';

const dbSDK: DynamodbSDK = new DynamodbSDK();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let statusCode: number;
    let body: string;

    try {
        // Check if the required Query Parameters are empty
        if (event.queryStringParameters === null) throw new ApiError("Empty request parameters", 400);

        // Check if the required fields are present
        const { id, date } = event.queryStringParameters;
        if (id === undefined) throw new ApiError("The 'id' property is required as a Query Parameters", 400);
        if (!isUUID(id)) throw new ApiError("The 'id' property must be a valid uuid", 400);
        if (date === undefined) throw new ApiError("The 'date' property is required as a Query Parameters", 400);
        if (!isDate(date)) throw new ApiError("The 'date' property is not valid", 400);

        // Call the getToDo method of DynamodbSDK to get a ToDo item to the table
        const todo: TodoQueryParams = {
            id,
            date: new Date(date)
        };
        const result = await dbSDK.getTodo(todo);

        if (result.Item === undefined) throw new ApiError("There are no matching ToDo", 404);

        // Return a successful response
        statusCode = 200;
        body = JSON.stringify({item: dbSDK.parseItem(result.Item)});
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
};