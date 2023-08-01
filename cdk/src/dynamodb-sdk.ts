import * as ddb from "@aws-sdk/client-dynamodb";

/** A class to interact with DynamoDB to store ToDo items. */
export class DynamodbSDK {
    /** The name of the DynamoDB table used to store ToDo items. */
    private tableName = process.env.TABLE_NAME;

    /** The DynamoDB client instance used to execute commands. */
    private ddbClient: ddb.DynamoDBClient = new ddb.DynamoDBClient({});

    /**
     * Retrieves all ToDo items from the DynamoDB table.
     * @returns A promise that resolves to the result of the Scan command.
     */
    public async getToDos(): Promise<ddb.ScanCommandOutput> {
        const params: ddb.ScanCommandInput = { TableName: this.tableName };
        return await this.ddbClient.send(new ddb.ScanCommand(params));
    };

    /**
     * Retrieves a specific ToDo item from the DynamoDB table based on its ID.
     * @param id The ID of the ToDo.
     * @param date The creation date of the ToDo.
     * @returns A promise that resolves to the result of the GetItem command.
     */
    public async getTodo(id: string, date: string): Promise<ddb.GetItemCommandOutput> {
        const params: ddb.GetItemCommandInput = {
            TableName: this.tableName,
            Key: {
                id: { S: id },
                date: { S: date },
            },
        };
        return await this.ddbClient.send(new ddb.GetItemCommand(params));
    };

    /**
     * Adds a new ToDo item to the DynamoDB table.
     * @param id The ID of the ToDo item.
     * @param date The creation date of the ToDo.
     * @returns A promise that resolves to the result of the PutItem command.
     */
    public async putToDo(id: string, date: string, name: string): Promise<ddb.PutItemCommandOutput> {
        const params: ddb.PutItemCommandInput = {
            TableName: this.tableName,
            Item: {
                id: { S: id },
                date: { S: date },
                name: { S: name },
            },
        };
        return await this.ddbClient.send(new ddb.PutItemCommand(params));
    };

    /**
     * Deletes a ToDo item from the DynamoDB table based on its ID and creating date.
     * @param id The ID of the ToDo item.
     * @param date The creation date of the ToDo.
     * @returns A promise that resolves to the result of the DeleteItem command.
     */
    public async deleteToDo(id: string, date: string): Promise<ddb.DeleteItemCommandOutput> {
        const params: ddb.DeleteItemCommandInput = {
            TableName: this.tableName,
            Key: {
                id: { S: id },
                date: { S: date },
            },
        };
        return await this.ddbClient.send(new ddb.DeleteItemCommand(params));
    };
};
