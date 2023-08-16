import * as ddb from "@aws-sdk/client-dynamodb";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    APIGatewayProxyEventQueryStringParameters
} from "aws-lambda";
import { randomUUID } from "crypto";
import type { IToDoPrimaryKey, IToDoAttributes, IToDo } from '../../common-types';

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

    constructor(primaryKey: ToDoPrimaryKey) {
        super();
        this.Key = primaryKey.serialize();
    };
};
class ItemParams extends DefaultParams {
    readonly Item: Record<string, ddb.AttributeValue>;

    constructor(toDo: ToDo) {
        super();
        this.Item = toDo.serialize();
    };
};

class ToDoPrimaryKey implements IToDoPrimaryKey {
    readonly id: string;
    readonly date: string;

    constructor(id: string, date: string) {
        this.id = id;
        this.date = date;
    };

    isEquals(obj: Object): boolean {
        let isEq: boolean = false;

        if (obj instanceof ToDoPrimaryKey)
            isEq = obj.id === this.id && obj.date === this.date;

        return isEq;
    };

    serialize(): { [key: string]: ddb.AttributeValue } {
        return { id: { S: this.id }, date: { S: this.date }};
    };
};
class ToDoAttributes implements IToDoAttributes {
    name: string;

    constructor(name: string) {
        this.name = name;
    };

    isEquals(obj: Object): boolean {
        let isEq: boolean = false;

        if (obj instanceof ToDoAttributes) isEq = obj.name === this.name;

        return isEq;
    };
};
class ToDo implements IToDo {
    primaryKey: ToDoPrimaryKey;
    attributes: ToDoAttributes;

    constructor(name: string)
    constructor(id: string, date: string, name: string)
    constructor(primaryKey: ToDoPrimaryKey, attributes: ToDoAttributes)
    constructor(...args: string[] | [ToDoPrimaryKey, ToDoAttributes]) {
        const howManyArgs = args.length;
        switch (howManyArgs) {
            case 1:
                this.primaryKey = new ToDoPrimaryKey(randomUUID(), new Date().toISOString());
                this.attributes = new ToDoAttributes(validateName(args[0]));
                break;
            case 2:
                if (typeof args[0] !== 'string' && typeof args[1] !== 'string') {
                    this.primaryKey = args[0];
                    this.attributes = args[1];
                }
                else this.error("The 2-argument constructor cannot be of type string");
                break;
            case 3:
                this.primaryKey = new ToDoPrimaryKey(args[0], args[1]);
                this.attributes = new ToDoAttributes(validateName(args[2]));
                break;
            default:
                this.error("Incorrect number of allowed parameters (allowed parameters: 1-3)");
                break;
        };
    };

    public get getPrimaryKey(): IToDoPrimaryKey {
        return this.primaryKey;
    };
    public get getAttributes(): IToDoAttributes {
        return this.attributes;
    };
    public get getToDo(): IToDo {
        return this
    };

    isEquals(obj: Object): boolean {
        return obj instanceof ToDo &&
            this.primaryKey.isEquals(obj.primaryKey) &&
            this.attributes.isEquals(obj.attributes);
    };

    serialize(): { [key: string]: ddb.AttributeValue } {
        return { id: { S: this.primaryKey.id }, date: { S: this.primaryKey.date }, name: { S: this.attributes.name } };
    };

    static deserializeItems(items: { [key: string]: ddb.AttributeValue }[]) {
        return items.map((item) => this.deserializeItem(item));
    };
    static deserializeItem(item: { [key: string]: ddb.AttributeValue }): ToDo {
        if (typeof item["id"].S === 'string' && typeof item["date"].S === 'string' && typeof item["name"].S === 'string') {
            return new ToDo(item["id"].S, item["date"].S, item["name"].S);
        }
        else throw new Error("ToDo deserialize error: Item types doesn't match ToDo types");
    };

    private error(msg: string) {
        throw new Error("ToDo constructor error: " + msg);
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
                ToDo.deserializeItems(Items);

        // Return a successful response
        return new ApiSuccessResponse({ items: resultItems });
    }
    catch (error) { return new ApiErrorResponse(error); };
};

function validateAttributes(body: string | null): string {
    // Check if the required body is empty
    if (body === null) throw new BadRequestError("Empty request body");

    // Check if the required fields are present in the request body and are valid
    const { name } = JSON.parse(body);

    return validateName(name);
};

async function setTodo(toDo: ToDo): Promise<APIGatewayProxyResult> {
    await ddbClient.send(new ddb.PutItemCommand(new ItemParams(toDo)));

    return new ApiSuccessResponse({ message: "ToDo created", item: toDo });
}

export async function postToDo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try { return await setTodo(new ToDo(validateAttributes(event.body))); }
    catch (error) { return new ApiErrorResponse(error); };
};

export async function putToDo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        if (event.queryStringParameters === null) throw new BadRequestError("Empty request parameters");
        const { id, date } = event.queryStringParameters;
        const primaryKey = new ToDoPrimaryKey(validateUUID(id), validateDate(date));

        const attributes = new ToDoAttributes(validateAttributes(event.body));

        return await setTodo(new ToDo(primaryKey, attributes));
    }
    catch (error) { return new ApiErrorResponse(error); };
};

/** Returns a ToDo if it matches it's Primary key */
export async function getToDo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const result = await ddbClient.send(new ddb.GetItemCommand(
            validateQuery(event.queryStringParameters)
        ));

        if (result.Item === undefined) throw new NotFoundError("There are no matching ToDo");

        return new ApiSuccessResponse({ item: ToDo.deserializeItem(result.Item) });
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
function parseItem(item: { [key: string]: ddb.AttributeValue }): { [key: string]: any } {
    const parsedItem: { [key: string]: any } = {};

    for (const key in item) {
        const value = item[key];

        switch (true) {
            case 'S' in value:
                const stringValue = value.S as string;
                const isDate = new Date(stringValue) instanceof Date && !isNaN(new Date(stringValue).getTime());
                parsedItem[key] = isDate ? new Date(stringValue) : stringValue;
                break;
            case 'N' in value:
                parsedItem[key] = parseFloat(value.N as string);
                break;
            case 'BOOL' in value:
                parsedItem[key] = value.BOOL;
                break;
            default:
                throw new Error(`Invalid data type for attribute '${key}'.`);
        };
    };
    return parsedItem;
};

/** Check if the Query Parameters are valid*/
function validateQuery(params: APIGatewayProxyEventQueryStringParameters | null): KeyParams {
    if (params === null) throw new BadRequestError("Empty request parameters");

    const { id, date } = params;
    return new KeyParams(new ToDoPrimaryKey(validateUUID(id), validateDate(date)));
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