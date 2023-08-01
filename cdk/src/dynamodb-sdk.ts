import * as ddb from "@aws-sdk/client-dynamodb";

export interface TodoQueryParams {
    id: string;
    date: Date;
};

export interface TodoPutParams extends TodoQueryParams {
    name: string;
};

export class DynamodbSDK {
    private tableName = process.env.TABLE_NAME;
    private ddbClient: ddb.DynamoDBClient = new ddb.DynamoDBClient({});

    public async getAllToDos(): Promise<{ [key: string]: any }[]> {
        const params: ddb.ScanCommandInput = { TableName: this.tableName };
        const result = await this.ddbClient.send(new ddb.ScanCommand(params));
        if (result.Items === undefined) throw new Error("ToDo table is empty");
        return this.parseItems(result.Items);
    };

    public async getTodo(todoParams: TodoQueryParams): Promise<{ [key: string]: any }> {
        const params: ddb.GetItemCommandInput = {
            TableName: this.tableName,
            Key: this.formatKey(todoParams),
        };
        const result = await this.ddbClient.send(new ddb.GetItemCommand(params));
        if (result.Item === undefined) throw new Error("There are no matching ToDo");
        return this.parseItem(result.Item);
    };

    public async setToDo(todoParams: TodoPutParams): Promise<ddb.PutItemCommandOutput> {
        const params: ddb.PutItemCommandInput = {
            TableName: this.tableName,
            Item: this.formatKey(todoParams),
        };
        return await this.ddbClient.send(new ddb.PutItemCommand(params));
    };

    public async deleteToDo(todoParams: TodoQueryParams): Promise<ddb.DeleteItemCommandOutput> {
        const params: ddb.DeleteItemCommandInput = {
            TableName: this.tableName,
            Key: this.formatKey(todoParams),
        };
        return await this.ddbClient.send(new ddb.DeleteItemCommand(params));
    };

    private formatKey(params: { [key: string]: any }): { [key: string]: ddb.AttributeValue } {
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

    public parseItems(items: Record<string, ddb.AttributeValue>[]): { [key: string]: any }[] {
        return items.map((item) => this.parseItem(item));
    };

    public parseItem(data: { [key: string]: ddb.AttributeValue }): { [key: string]: any } {
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
};
