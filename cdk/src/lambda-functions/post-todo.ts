import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK, TodoPutParams } from "../dynamodb-sdk";
import { randomUUID } from "crypto";
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

        // Check if the required fields are present in the request body
        const req: Request = new Request();
        req.validateName(requestBody.name);

        // Call the putToDo method of DynamodbSDK to add the new ToDo item to the table
        const todo: TodoPutParams = {
            id: randomUUID(),
            date: new Date(),
            name: requestBody.name
        };
        await dbSDK.setToDo(todo);

        // Return a successful response
        statusCode = 200;
        body = JSON.stringify({ message: "ToDo created" });
    }
    catch (error) {
        req.catchError(error);
        statusCode = req.statusCode;
        body = JSON.stringify(req.rawBody);
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body,
    };
};