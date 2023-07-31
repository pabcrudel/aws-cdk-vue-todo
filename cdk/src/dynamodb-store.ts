import { ToDo, ToDoDynamoDB } from './todo-interfaces';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandOutput,
    PutCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";

/** A class that implements the `ToDoDynamo` interface to interact with DynamoDB to store ToDo items. */
export class DynamoDBStore implements ToDoDynamoDB {
    /** The name of the DynamoDB table used to store ToDo items.*/
    private static tableName = process.env.TABLE_NAME;

    /** The DynamoDB client instance used to execute commands.*/
    private static ddbClient: DynamoDBClient = new DynamoDBClient({});

    /** The DynamoDB DocumentClient instance used to execute high-level commands.*/
    private static ddbDocClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(DynamoDBStore.ddbClient);

    /**
     * Retrieves a ToDo item from the DynamoDB store based on its ID.
     * @param id - The ID of the ToDo item to retrieve.
     * @returns A Promise that resolves to the retrieved ToDo item, or undefined if not found.
     */
    public async getToDo(id: string): Promise<ToDo | undefined> {
        const params: GetCommand = new GetCommand({
            TableName: DynamoDBStore.tableName,
            Key: { id: id },
        });
        const result: GetCommandOutput = await DynamoDBStore.ddbDocClient.send(
            params
        );
        return result.Item as ToDo;
    };

    /**
     * Adds or updates a ToDo item in the DynamoDB store.
     * @param todo - The ToDo item to add or update.
     * @returns A Promise that resolves when the ToDo item is successfully added or updated.
     */
    public async putToDo(todo: ToDo): Promise<void> {
        const params: PutCommand = new PutCommand({
            TableName: DynamoDBStore.tableName,
            Item: {
                name: todo.name,
                id: todo.id,
            },
        });
        await DynamoDBStore.ddbDocClient.send(params);
    };

    /**
     * Deletes a ToDo item from the DynamoDB store based on its ID.
     * @param id - The ID of the ToDo item to delete.
     * @returns A Promise that resolves when the ToDo item is successfully deleted.
     */
    public async deleteToDo(id: string): Promise<void> {
        const params: DeleteCommand = new DeleteCommand({
            TableName: DynamoDBStore.tableName,
            Key: { id: id },
        });
        await DynamoDBStore.ddbDocClient.send(params);
    };

    /**
     * Retrieves multiple ToDo items from the DynamoDB store.
     * @returns A Promise that resolves to an array of ToDo items, or undefined if no items are found.
     */
    public async getToDos(): Promise<ToDo[] | undefined> {
        const params: ScanCommand = new ScanCommand({
            TableName: DynamoDBStore.tableName,
            Limit: 20,
        });
        const result = await DynamoDBStore.ddbDocClient.send(params);
        return result.Items as ToDo[];
    };
};