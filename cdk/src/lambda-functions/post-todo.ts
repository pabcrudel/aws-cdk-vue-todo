import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dbSDK from "../dynamodb-sdk";
import { randomUUID } from "crypto";
import { BadRequestError, Request, validateName } from '../api-helper';

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
        validateName(requestBody.name);

        // Call the putToDo method of DynamodbSDK to add the new ToDo item to the table
        const todo: dbSDK.TodoPutParams = {
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