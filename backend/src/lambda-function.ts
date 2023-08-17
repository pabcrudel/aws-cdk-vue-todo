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

    constructor(primaryKey: Record<string, ddb.AttributeValue>) {
        super();
        this.Key = primaryKey;
    };
};
class ItemParams extends DefaultParams {
    readonly Item: Record<string, ddb.AttributeValue>;

    constructor(toDo: Record<string, ddb.AttributeValue>) {
        super();
        this.Item = toDo;
    };
};

class ToDoPrimaryKey implements IToDoPrimaryKey {
    readonly id: string;
    readonly date: string;

    constructor()
    constructor(params: APIGatewayProxyEventQueryStringParameters | null)
    constructor(id: string, date: string)
    constructor(...args: any[]) {
        switch (args.length) {
            case 0:
                this.id = randomUUID();
                this.date = new Date().toISOString();
                break;
            case 1:
                if (args[0] === null) throw new BadRequestError("Empty request parameters");
                const { id, date } = args[0];
                this.id = this.validateUUID(id);
                this.date = this.validateDate(date);
                break;
            case 2:
                this.id = this.validateUUID(args[0]);
                this.date = this.validateDate(args[1]);
                break;
            default:
                throw new Error(`ToDoPrimaryKey constructor error: Incorrect number of allowed parameters (expected: 0-2, got: ${args.length})`);
                break;
        };
    };

    public get keyParams(): KeyParams {
        return new KeyParams(this.serialize());
    };

    serialize(): Record<string, ddb.AttributeValue> {
        return { id: { S: this.id }, date: { S: this.date } };
    };

    validateUUID(uuid: any): string {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (uuid === undefined) throw new BadRequestError("The 'id' property is required");
        else if (!uuidRegex.test(uuid)) throw new BadRequestError("The 'id' property must be a valid uuid");

        return uuid;
    };

    validateDate(date: any): string {
        if (date === undefined) throw new BadRequestError("The 'date' property is required");
        else {
            const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
            if (!isoDateRegex.test(date)) throw new BadRequestError("The 'date' property is not a valid ISO date");
        };

        return date;
    };
};
class ToDoAttributes implements IToDoAttributes {
    name: string;

    private constructor(arg: string | null) {
        this.name = this.validateName(arg);
    };

    serialize(): { [key: string]: ddb.AttributeValue } {
        return { name: { S: this.name } };
    };

    static withName(name: string): ToDoAttributes {
        return new ToDoAttributes(name);
    };

    static withBody(body: string | null): ToDoAttributes {
        if (body === null) throw new BadRequestError("Empty request body");
        const parsedBody = JSON.parse(body);
        return new ToDoAttributes(parsedBody.name);
    };

    validateName(name: any): string {
        if (name === undefined) throw new BadRequestError("The 'name' property is required");
        else if (typeof name !== 'string') throw new BadRequestError("The 'name' property must be a string");
        else if (name.length < 1) throw new BadRequestError("The 'name' property cannot be empty");

        return name;
    };
};
class ToDo implements IToDo {
    primaryKey: ToDoPrimaryKey;
    attributes: ToDoAttributes;

    constructor(body: string | null)
    constructor(queryParameters: APIGatewayProxyEventQueryStringParameters | null, body: string | null)
    constructor(id: string, date: string, name: string)
    constructor(...args: any[]) {
        switch (args.length) {
            case 1:
                this.primaryKey = new ToDoPrimaryKey();
                this.attributes = ToDoAttributes.withBody(args[0]);
                break;
            case 2:
                this.primaryKey = new ToDoPrimaryKey(args[0]);
                this.attributes = ToDoAttributes.withBody(args[1]);
                break;
            case 3:
                this.primaryKey = new ToDoPrimaryKey(args[0], args[1]);
                this.attributes = ToDoAttributes.withName(args[2]);
                break;
            default:
                this.error(`Incorrect number of allowed parameters (expected: 1-3, got: ${args.length})`);
                break;
        };
    };

    public get itemParams(): ItemParams {
        return new ItemParams(this.serialize());
    };

    /** Convert a `ToDo` object into a format that can be stored in DynamoDB */
    serialize(): { [key: string]: ddb.AttributeValue } {
        return { ...this.primaryKey.serialize(), ...this.attributes.serialize() };
    };

    /** Takes an array of DynamoDB items and returns an array of `ToDo` objects. */
    static deserializeItems(items: { [key: string]: ddb.AttributeValue }[]): ToDo[] {
        return items.map((item) => this.deserializeItem(item));
    };
    /** Convert a DynamoDB item into a `ToDo` object. */
    static deserializeItem(item: { [key: string]: ddb.AttributeValue }): ToDo {
        if (typeof item["id"].S === 'string' && typeof item["date"].S === 'string' && typeof item["name"].S === 'string') {
            return new ToDo(item["id"].S, item["date"].S, item["name"].S);
        }
        else throw new Error("ToDo deserialize error: Item types doesn't match ToDo types");
    };

    /** Throws an error with a custom msg */
    private error(msg: string) {
        throw new Error("ToDo constructor error: " + msg);
    };
};

/** The DynamoDB client instance used to execute commands. */
const ddbClient: ddb.DynamoDBClient = new ddb.DynamoDBClient({});

/** Retrieve stored ToDos */
export async function getAllToDos(): Promise<APIGatewayProxyResult> {
    try {
        const { Items } = await ddbClient.send(new ddb.ScanCommand(new DefaultParams));

        const resultItems =
            (Items === undefined || Items.length === 0) ?
                [] :
                ToDo.deserializeItems(Items);

        return new ApiSuccessResponse({ items: resultItems });
    }
    catch (error) { return new ApiErrorResponse(error); };
};

/** Saves or updates a ToDo */
async function setTodo(toDo: ToDo): Promise<APIGatewayProxyResult> {
    await ddbClient.send(new ddb.PutItemCommand(toDo.itemParams));

    return new ApiSuccessResponse({ message: "ToDo created", item: toDo });
};

export async function postToDo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try { return await setTodo(new ToDo(event.body)); }
    catch (error) { return new ApiErrorResponse(error); };
};

export async function putToDo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try { return await setTodo(new ToDo(event.queryStringParameters, event.body)); }
    catch (error) { return new ApiErrorResponse(error); };
};

/** Returns a ToDo if it matches it's Primary key */
export async function getToDo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const primaryKey = new ToDoPrimaryKey(event.queryStringParameters);
        const result = await ddbClient.send(new ddb.GetItemCommand(primaryKey.keyParams));

        if (result.Item === undefined) throw new NotFoundError("There are no matching ToDo");

        return new ApiSuccessResponse({ item: ToDo.deserializeItem(result.Item) });
    }
    catch (error) { return new ApiErrorResponse(error); };
};

/** Delete a ToDo if it matches it's Primary key */
export async function deleteToDo(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const primaryKey = new ToDoPrimaryKey(event.queryStringParameters);
        await ddbClient.send(new ddb.DeleteItemCommand(primaryKey.keyParams));

        return new ApiSuccessResponse({ message: "ToDo deleted" });
    }
    catch (error) { return new ApiErrorResponse(error); };
};