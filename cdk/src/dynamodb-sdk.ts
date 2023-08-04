import * as ddb from "@aws-sdk/client-dynamodb";

export interface toDoQueryParameters {
    id: string;
    date: Date | string;
};
export interface toDoBodyParameters extends toDoQueryParameters {
    name: string;
};

/** The name of the DynamoDB table used to store ToDo items. */
const tableName = process.env.TABLE_NAME;

/** The DynamoDB client instance used to execute commands. */
const ddbClient: ddb.DynamoDBClient = new ddb.DynamoDBClient({});

/**
 * The function getAllToDos retrieves all items from a DynamoDB table.
 * @returns a Promise that resolves to an object of type `ddb.ScanCommandOutput`.
 */
export async function getAllToDos(): Promise < ddb.ScanCommandOutput > {
    const params: ddb.ScanCommandInput = { TableName: tableName };
    return await ddbClient.send(new ddb.ScanCommand(params));
};

/**
 * The function `getTodo` retrieves a todo item from a DynamoDB table based on the provided query
 * parameters.
 * @param {toDoQueryParameters} todoParams - The `todoParams` parameter is an object that contains the
 * query parameters for retrieving a specific todo item from a DynamoDB table. It is of type
 * `toDoQueryParameters`.
 * @returns a Promise of type `ddb.GetItemCommandOutput`.
 */
export async function getTodo(todoParams: toDoQueryParameters): Promise < ddb.GetItemCommandOutput > {
    const params: ddb.GetItemCommandInput = {
        TableName: tableName,
        Key: formatKey(todoParams),
    };
    return await ddbClient.send(new ddb.GetItemCommand(params));
};

/**
 * The function sets a new to-do item in a DynamoDB table.
 * @param {toDoBodyParameters} todoParams - The `todoParams` parameter is an object that contains the
 * data for the to-do item that you want to add or update in the DynamoDB table. The specific
 * properties and their types depend on the structure of your to-do item.
 * @returns a Promise of type `ddb.PutItemCommandOutput`.
 */
export async function setToDo(todoParams: toDoBodyParameters): Promise < ddb.PutItemCommandOutput > {
    const params: ddb.PutItemCommandInput = {
        TableName: tableName,
        Item: formatKey(todoParams),
    };
    return await ddbClient.send(new ddb.PutItemCommand(params));
};

/**
 * The function deletes a ToDo item from a DynamoDB table.
 * @param {toDoQueryParameters} todoParams - The `todoParams` parameter is an object that contains the
 * query parameters for the todo item that you want to delete. It could include properties such as
 * `id`, `title`, `description`, or any other relevant information that uniquely identifies the todo
 * item in your database.
 * @returns a Promise that resolves to an object of type `ddb.DeleteItemCommandOutput`.
 */
export async function deleteToDo(todoParams: toDoQueryParameters): Promise < ddb.DeleteItemCommandOutput > {
    const params: ddb.DeleteItemCommandInput = {
        TableName: tableName,
        Key: formatKey(todoParams),
    };
    return await ddbClient.send(new ddb.DeleteItemCommand(params));
};

/**
 * The `formatKey` function takes an object as input and formats its keys and values into an object
 * with DynamoDB attribute values.
 * @param params - An object containing key-value pairs, where the key is a string and the value can be
 * of any data type.
 * @returns An object of type `{ [key: string]: ddb.AttributeValue }`.
 */
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

/**
 * The function `parseItems` takes an array of items and returns an array of parsed items.
 * @param {Record < string, ddb.AttributeValue > []} items - An array of objects where each object
 * represents an item and has a string key and a value of type `ddb.AttributeValue`.
 * @returns an array of objects, where each object has a key-value pair. The key is a string and the
 * value can be of any type.
 */
export function parseItems(items: Record < string, ddb.AttributeValue > []): { [key: string]: any } [] {
    return items.map((item) => parseItem(item));
};

/**
 * The `parseItem` function takes in a data object representing an item in a DynamoDB table and returns
 * a parsed version of the data with appropriate data types.
 * @param data - The `data` parameter is an object that represents an item in a DynamoDB table. It has
 * string keys and values of type `ddb.AttributeValue`. The `ddb.AttributeValue` type is an object that
 * can have one of the following properties: `S` (string), `N` (
 * @returns The function `parseItem` returns an object of type `{ [key: string]: any }`.
 */
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
