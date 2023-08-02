import * as ddb from "@aws-sdk/client-dynamodb";

export interface TodoQueryParams {
    id: string;
    date: Date;
};

export interface TodoPutParams extends TodoQueryParams {
    name: string;
};

/** The name of the DynamoDB table used to store ToDo items. */
const tableName = process.env.TABLE_NAME;

/** The DynamoDB client instance used to execute commands. */
const ddbClient: ddb.DynamoDBClient = new ddb.DynamoDBClient({});

/**
 * Retrieves all ToDo items from the DynamoDB table.
 * @returns A promise that resolves to the result of the Scan command.
 */
export async function getAllToDos(): Promise < ddb.ScanCommandOutput > {
    const params: ddb.ScanCommandInput = { TableName: tableName };
    return await ddbClient.send(new ddb.ScanCommand(params));
};

/**
 * Retrieves a specific ToDo item from the DynamoDB table based on its ID.
 * @param id The ID of the ToDo.
 * @param date The creation date of the ToDo.
 * @returns A promise that resolves to the result of the GetItem command.
 */
export async function getTodo(todoParams: TodoQueryParams): Promise < ddb.GetItemCommandOutput > {
    const params: ddb.GetItemCommandInput = {
        TableName: tableName,
        Key: formatKey(todoParams),
    };
    return await ddbClient.send(new ddb.GetItemCommand(params));
};

/**
 * Adds a new ToDo item to the DynamoDB table.
 * @param id The ID of the ToDo item.
 * @param date The creation date of the ToDo.
 * @returns A promise that resolves to the result of the PutItem command.
 */
export async function setToDo(todoParams: TodoPutParams): Promise < ddb.PutItemCommandOutput > {
    const params: ddb.PutItemCommandInput = {
        TableName: tableName,
        Item: formatKey(todoParams),
    };
    return await ddbClient.send(new ddb.PutItemCommand(params));
};

/**
 * Deletes a ToDo item from the DynamoDB table based on its ID and creating date.
 * @param id The ID of the ToDo item.
 * @param date The creation date of the ToDo.
 * @returns A promise that resolves to the result of the DeleteItem command.
 */
export async function deleteToDo(todoParams: TodoQueryParams): Promise < ddb.DeleteItemCommandOutput > {
    const params: ddb.DeleteItemCommandInput = {
        TableName: tableName,
        Key: formatKey(todoParams),
    };
    return await ddbClient.send(new ddb.DeleteItemCommand(params));
};

export function formatKey(params: { [key: string]: any }): { [key: string]: ddb.AttributeValue } {
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

export function parseItems(items: Record < string, ddb.AttributeValue > []): { [key: string]: any } [] {
    return items.map((item) => parseItem(item));
};

export function parseItem(data: { [key: string]: ddb.AttributeValue }): { [key: string]: any } {
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
