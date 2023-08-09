import * as ddb from "@aws-sdk/client-dynamodb";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    APIGatewayProxyEventQueryStringParameters
} from "aws-lambda";
import { randomUUID } from "crypto";
import type { IToDo } from '../../common-types';

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

class DefaultParams {
    /** The name of the DynamoDB table used to store ToDo items. */
    readonly TableName = process.env.TABLE_NAME;
};
class KeyParams extends DefaultParams {
    readonly Key: Record<string, ddb.AttributeValue>;

    constructor(id: string, date: string) {
        super();
        this.Key = formatItems({ id, date });
    };
};
class ItemParams extends DefaultParams {
    readonly Item: Record<string, ddb.AttributeValue>;

    constructor(toDo: IToDo) {
        super();
        this.Item = formatItems(toDo);
    };
};

class ToDo implements IToDo {
    readonly name: string;
    readonly id: string;
    readonly date: string;

    constructor(id: any, date: any, name: any) {
        if (id === undefined || date === undefined) {
            this.id = randomUUID();
            this.date = new Date().toISOString();
        }
        else {
            this.id = validateUUID(id);
            this.date = validateDate(date);
        };
        this.name = validateName(name);
    };
};

/** The DynamoDB client instance used to execute commands. */
const ddbClient: ddb.DynamoDBClient = new ddb.DynamoDBClient({});

export async function getAllToDos(): Promise<APIGatewayProxyResult> {
    try {
        // Parse the request body to extract all the ToDos
        const { Items } = await ddbClient.send(new ddb.ScanCommand(new DefaultParams));

        const resultItems =
            (Items === undefined || Items.length === 0) ?
                [] :
                parseItems(Items);

        // Return a successful response
        return new ApiSuccessResponse({ items: resultItems });
    }
    catch (error) { return new ApiErrorResponse(error); };
};

async function setTodo(body: string | null): Promise<ApiResponse> {
    // Check if the required body is empty
    if (body === null) throw new BadRequestError("Empty request body");

    // Check if the required fields are present in the request body and are valid
    const { id, date, name } = JSON.parse(body);

    // Set the ToDo into the database
    const toDo = new ToDo(id, date, name);
    await ddbClient.send(new ddb.PutItemCommand(new ItemParams(toDo)));

    // Return a successful response
    return new ApiSuccessResponse({ message: "ToDo created", item: toDo });
};

export async function postToDo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try { return setTodo(event.body); }
    catch (error) { return new ApiErrorResponse(error); };
};

export async function putToDo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try { return setTodo(event.body); }
    catch (error) { return new ApiErrorResponse(error); };
};

/** Returns a ToDo if it matches it's Primary key */
export async function getToDo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const result = await ddbClient.send(new ddb.GetItemCommand(
            validateQuery(event.queryStringParameters)
        ));

        if (result.Item === undefined) throw new NotFoundError("There are no matching ToDo");

        return new ApiSuccessResponse({ item: parseItem(result.Item) });
    }
    catch (error) { return new ApiErrorResponse(error); };
};

/** Delete a ToDo if it matches it's Primary key */
export async function deleteToDo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        await ddbClient.send(new ddb.DeleteItemCommand(
            validateQuery(event.queryStringParameters)
        ));

        return new ApiSuccessResponse({ message: "ToDo deleted" });
    }
    catch (error) { return new ApiErrorResponse(error); };
};

/** Takes an object and formats its keys and values into an object with DynamoDB attribute values. */
function formatItems(params: { [key: string]: any }): { [key: string]: ddb.AttributeValue } {
    const formattedKey: { [key: string]: ddb.AttributeValue } = {};
    for (const key in params) {
        const value = params[key];
        switch (typeof value) {
            case 'string':
                formattedKey[key] = { S: value };
                break;
            case 'number':
                formattedKey[key] = { N: value.toString() };
                break;
            case 'boolean':
                formattedKey[key] = { BOOL: value };
                break;
            case 'object':
                if (value instanceof Date) formattedKey[key] = { S: value.toISOString() };
                else throw new Error(`Invalid data type for key attribute '${key}'.`);
                break;
            default:
                throw new Error(`Invalid data type for key attribute '${key}'.`);
        };
    };
    return formattedKey;
};

/** Takes an array of items and returns an array of parsed items. */
function parseItems(items: Record<string, ddb.AttributeValue>[]): { [key: string]: any }[] {
    return items.map((item) => parseItem(item));
};

/** Takes in a data object representing an item in a DynamoDB table and returns a parsed version of the data with appropriate data types. */
function parseItem(data: { [key: string]: ddb.AttributeValue }): { [key: string]: any } {
    const parsedData: { [key: string]: any } = {};

    for (const key in data) {
        const value = data[key];

        switch (true) {
            case 'S' in value:
                const stringValue = value.S as string;
                const isDate = new Date(stringValue) instanceof Date && !isNaN(new Date(stringValue).getTime());
                parsedData[key] = isDate ? new Date(stringValue) : stringValue;
                break;
            case 'N' in value:
                parsedData[key] = parseFloat(value.N as string);
                break;
            case 'BOOL' in value:
                parsedData[key] = value.BOOL;
                break;
            default:
                throw new Error(`Invalid data type for attribute '${key}'.`);
        };
    };
    return parsedData;
};

/** Check if the Query Parameters are valid*/
function validateQuery(params: APIGatewayProxyEventQueryStringParameters | null): KeyParams {
    if (params === null) throw new BadRequestError("Empty request parameters");

    const { id, date } = params;
    return new KeyParams(validateUUID(id), validateDate(date));
};

/** Check if the id is a valid UUID */
function validateUUID(uuid: any): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (uuid === undefined) throw new BadRequestError("The 'id' property is required");
    else if (!uuidRegex.test(uuid)) throw new BadRequestError("The 'id' property must be a valid uuid");
    
    return uuid;
};

/** Check if the date is in ISO format */
function validateDate(date: any): string {
    if (date === undefined) throw new BadRequestError("The 'date' property is required");
    else {
        const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
        if (!isoDateRegex.test(date)) throw new BadRequestError("The 'date' property is not a valid ISO date");
    };

    return date;
};

/** Check if the name's type is string and is not empty */
function validateName(name: any): string {
    if (name === undefined) throw new BadRequestError("The 'name' property is required");
    else if (typeof name !== 'string') throw new BadRequestError("The 'name' property must be a string");
    else if (name.length < 1) throw new BadRequestError("The 'name' property cannot be empty");

    return name;
};