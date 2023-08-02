import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK, TodoPutParams } from "../dynamodb-sdk";
import { BadRequestError, Request, validateDate, validateName, validateUUID } from '../api-helper';

const dbSDK: DynamodbSDK = new DynamodbSDK();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let statusCode: number;
    let body: string;

    try {
        // Check if the required body is empty
        if (event.body === null) throw new BadRequestError("Empty request body");

        // Parse the request body to extract the ToDo item
        const requestBody = JSON.parse(event.body);
        const { id, date, name } = requestBody;

        // Check if the required fields are present in the request body and are valid
        validateUUID(id);
        validateDate(date);
        validateName(name);

        // Call the putToDo method of DynamodbSDK to add the new ToDo item to the table
        const todo: TodoPutParams = {
            id: id,
            date: date,
            name: name
        };
        await dbSDK.setToDo(todo);

        // Return a successful response
        statusCode = 200;
        body = JSON.stringify({ message: "ToDo created" });
    }
    catch (error) {
        Request.catchError(error);
        statusCode = Request.statusCode;
        body = JSON.stringify(Request.rawBody);
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body,
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