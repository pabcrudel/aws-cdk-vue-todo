import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK, TodoQueryParams } from "../dynamodb-sdk";
import { BadRequestError, Request } from '../api-helper';

const dbSDK: DynamodbSDK = new DynamodbSDK();
const req: Request = new Request();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let statusCode: number;
    let body: string;

    try {
        // Check if the required body is empty
        if (event.body === null) throw new BadRequestError("Empty request body");

        // Parse the request body to extract the ToDo item
        const requestBody = JSON.parse(event.body);
        const { id, date } = requestBody;

        // Check if the required fields are present in the request body
        const req: Request = new Request();
        req.validateUUID(id);
        req.validateDate(date);

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
        req.catchError(error);
        statusCode = req.statusCode;
        body = JSON.stringify(req.rawBody);
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