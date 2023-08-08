import * as ddb from "@aws-sdk/client-dynamodb";

export interface toDoQueryParameters {
    id: string;
    date: string;
};
export interface toDoBodyParameters extends toDoQueryParameters {
    name: string;
};

/** The name of the DynamoDB table used to store ToDo items. */
const tableName = process.env.TABLE_NAME;

/** The DynamoDB client instance used to execute commands. */
const ddbClient: ddb.DynamoDBClient = new ddb.DynamoDBClient({});

/** The function getAllToDos retrieves all items from a DynamoDB table. */
export async function getAllToDos(): Promise < ddb.ScanCommandOutput > {
    const params: ddb.ScanCommandInput = { TableName: tableName };
    return await ddbClient.send(new ddb.ScanCommand(params));
};

/** The function `getTodo` retrieves a todo item from a DynamoDB table based on the provided query parameters. */
export async function getTodo(todoParams: toDoQueryParameters): Promise < ddb.GetItemCommandOutput > {
    const params: ddb.GetItemCommandInput = {
        TableName: tableName,
        Key: formatKey(todoParams),
    };
    return await ddbClient.send(new ddb.GetItemCommand(params));
};

/** The function sets a new to-do item in a DynamoDB table. */
export async function setToDo(todoParams: toDoBodyParameters): Promise < ddb.PutItemCommandOutput > {
    const params: ddb.PutItemCommandInput = {
        TableName: tableName,
        Item: formatKey(todoParams),
    };
    return await ddbClient.send(new ddb.PutItemCommand(params));
};

/** The function deletes a ToDo item from a DynamoDB table. */
export async function deleteToDo(todoParams: toDoQueryParameters): Promise < ddb.DeleteItemCommandOutput > {
    const params: ddb.DeleteItemCommandInput = {
        TableName: tableName,
        Key: formatKey(todoParams),
    };
    return await ddbClient.send(new ddb.DeleteItemCommand(params));
};

/** The `formatKey` function takes an object as input and formats its keys and values into an object with DynamoDB attribute values. */
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

/** The function `parseItems` takes an array of items and returns an array of parsed items. */
export function parseItems(items: Record < string, ddb.AttributeValue > []): { [key: string]: any } [] {
    return items.map((item) => parseItem(item));
};

/** The `parseItem` function takes in a data object representing an item in a DynamoDB table and returns a parsed version of the data with appropriate data types. */
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
