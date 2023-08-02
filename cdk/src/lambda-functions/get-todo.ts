import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK, TodoQueryParams } from "../dynamodb-sdk";
import { BadRequestError, NotFoundError, Request, validateDate, validateUUID } from '../api-helper';

const dbSDK: DynamodbSDK = new DynamodbSDK();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let statusCode: number;
    let body: string;

    try {
        // Check if the required Query Parameters are empty
        if (event.queryStringParameters === null) throw new BadRequestError("Empty request parameters");

        // Check if the required fields are present
        const { id, date } = event.queryStringParameters;
        validateUUID(id);
        validateDate(date);

        // Call the getToDo method of DynamodbSDK to get a ToDo item to the table
        const todo: TodoQueryParams = {
            id: id!,
            date: new Date(date!)
        };
        const result = await dbSDK.getTodo(todo);

        if (result.Item === undefined) throw new NotFoundError("There are no matching ToDo");

        // Return a successful response
        statusCode = 200;
        body = JSON.stringify({item: dbSDK.parseItem(result.Item)});
    }
    catch (error) {
        Request.catchError(error);
        statusCode = Request.statusCode;
        body = JSON.stringify(Request.rawBody);
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