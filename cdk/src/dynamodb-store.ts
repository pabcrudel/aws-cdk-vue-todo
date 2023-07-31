import { ToDo, ToDoDynamo } from './todo-interfaces';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

export class DynamoDBStore implements ToDoDynamo {
    private static tableName = process.env.TABLE_NAME;
    private static ddbClient: DynamoDBClient = new DynamoDBClient({});
    private static ddbDocClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(DynamoDBStore.ddbClient);

    public async getToDo(id: string): Promise<ToDo | undefined> {
        const params: GetCommand = new GetCommand({
            TableName: DynamoDBStore.tableName,
            Key: {id: id,},
        });
        const result:GetCommandOutput = await DynamoDBStore.ddbDocClient.send(params);
        return result.Item as ToDo;
    };

    putToDo: (todo: ToDo) => Promise<void>;
    deleteToDo: (id: string) => Promise<void>;
    getToDos: () => Promise<ToDo[] | undefined>;
}