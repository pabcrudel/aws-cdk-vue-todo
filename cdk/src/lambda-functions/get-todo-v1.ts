import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK, TodoQueryParams } from "../dynamodb-sdk-v1";

const dbSDK: DynamodbSDK = new DynamodbSDK();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let statusCode: number = 400;
    let body: string;

    try {
        // Check if the required Query Parameters are empty
        if (event.queryStringParameters === null) throw new Error("Empty request parameters");

        // Check if the required fields are present
        const { id, date } = event.queryStringParameters;
        if (id === undefined) throw new Error("The 'id' property is required as a Query Parameters");
        if (!isUUID(id)) throw new Error("The 'id' property must be a valid uuid");
        if (date === undefined) throw new Error("The 'date' property is required as a Query Parameters");
        if (!isDate(date)) throw new Error("The 'date' property is not valid");

        // Call the getToDo method of DynamodbSDK to get a ToDo item to the table
        const todo: TodoQueryParams = {
            id,
            date: new Date(date)
        };
        const result = await dbSDK.getTodo(todo);

        if (result.Item === undefined) throw new Error("There are no matching ToDo");

        // Return a successful response
        body = JSON.stringify({item: dbSDK.parseItem(result.Item)});
    } 
    catch (error) {
        // Return an error response if there was any issue getting the ToDo item
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