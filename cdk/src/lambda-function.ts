import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dbSDK from "./dynamodb-sdk";
import { randomUUID } from "crypto";

class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ApiError";
    };
};
class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, 400);
    };
};
class NotFoundError extends ApiError {
    constructor(message: string) {
        super(message, 404);
    };
};
class ApiResponse implements APIGatewayProxyResult {
    readonly statusCode: number;
    readonly headers = {
        "content-type": "application/json",
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
    };
    readonly body: string;

    constructor(statusCode: number, rawBody: any) {
        this.statusCode = statusCode;
        this.body = JSON.stringify(rawBody);
    };
};
class ApiSuccessResponse extends ApiResponse {
    constructor(rawBody: any) {
        super(200, rawBody);
    };
};
class ApiErrorResponse extends ApiResponse {
    constructor(error: any) {
        super(
            error instanceof ApiError ? error.statusCode : 500,
            { error: error instanceof Error ? error.message : "Unknown error occurred" },
        );
    };
};

let response: APIGatewayProxyResult;

export async function getAllTodos(): Promise<APIGatewayProxyResult> {
    try {
        // Parse the request body to extract all the ToDos
        const result = await dbSDK.getAllToDos();

        const resultItems =
            (result.Items === undefined || result.Items.length === 0) ?
                [] :
                dbSDK.parseItems(result.Items);

        // Return a successful response
        response = new ApiSuccessResponse({ items: resultItems });
    }
    catch (error) {
        response = new ApiErrorResponse(error);
    };

    return response;
};

export async function getTodo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        // Check if the required Query Parameters are empty
        if (event.queryStringParameters === null) throw new BadRequestError("Empty request parameters");

        // Check if the required fields are present
        const { id, date } = event.queryStringParameters;
        validateUUID(id);
        validateDate(date);

        // Call the getToDo method of DynamodbSDK to get a ToDo item to the table
        const todo: dbSDK.toDoQueryParameters = {
            id: id!,
            date: date!
        };
        const result = await dbSDK.getTodo(todo);

        if (result.Item === undefined) throw new NotFoundError("There are no matching ToDo");

        // Return a successful response
        response = new ApiSuccessResponse({ item: dbSDK.parseItem(result.Item) });
    }
    catch (error) {
        response = new ApiErrorResponse(error);
    }

    return response;
};

export async function postTodo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        // Check if the required body is empty
        if (event.body === null) throw new BadRequestError("Empty request body");

        // Parse the request body to extract the ToDo item
        const requestBody = JSON.parse(event.body);

        // Check if the required fields are present in the request body
        validateName(requestBody.name);

        // Call the putToDo method of DynamodbSDK to add the new ToDo item to the table
        const todo: dbSDK.toDoBodyParameters = {
            id: randomUUID(),
            date: new Date().toISOString(),
            name: requestBody.name
        };
        await dbSDK.setToDo(todo);

        // Return a successful response
        response = new ApiSuccessResponse({ message: "ToDo created", item: todo });
    }
    catch (error) {
        response = new ApiErrorResponse(error);
    };

    return response;
};

export async function putTodo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
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
        const todo: dbSDK.toDoBodyParameters = {
            id: id,
            date: date,
            name: name
        };
        await dbSDK.setToDo(todo);

        // Return a successful response
        response = new ApiSuccessResponse({ message: "ToDo created", item: todo });
    }
    catch (error) {
        response = new ApiErrorResponse(error);
    };

    return response;
};

export async function deleteTodo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        // Check if the required body is empty
        if (event.body === null) throw new BadRequestError("Empty request body");

        // Parse the request body to extract the ToDo item
        const requestBody = JSON.parse(event.body);
        const { id, date } = requestBody;

        // Check if the required fields are present in the request body
        validateUUID(id);
        validateDate(date);

        // Call the deleteToDo method of DynamodbSDK to delete a ToDo item from the table
        const todo: dbSDK.toDoQueryParameters = { id, date };
        await dbSDK.deleteToDo(todo);

        response = new ApiSuccessResponse({ message: "ToDo deleted" });
    }
    catch (error) {
        response = new ApiErrorResponse(error);
    }

    return response;
};

function validateUUID(uuid: any) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (uuid === undefined) throw new BadRequestError("The 'id' property is required");
    else if (!uuidRegex.test(uuid)) throw new BadRequestError("The 'id' property must be a valid uuid");
};

function validateDate(dateStr: any) {
    if (dateStr === undefined) throw new BadRequestError("The 'date' property is required");
    else {
        const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
        if (!isoDateRegex.test(dateStr)) throw new BadRequestError("The 'date' property is not a valid ISO date");
    };
};

function validateName(name: any) {
    if (name === undefined) throw new BadRequestError("The 'name' property is required");
    else if (typeof name !== 'string') throw new BadRequestError("The 'name' property must be a string");
    else if (name.length < 1) throw new BadRequestError("The 'name' property cannot be empty");
};
