import { ToDo, ToDoDynamo } from './todo-interfaces';
const { DynamoDB, Lambda } = require('aws-sdk');

export class DynamoDBStore implements ToDoDynamo {
    private static tableName = process.env.TABLE_NAME;

    getToDo: (id: string) => Promise<ToDo | undefined>;
    putToDo: (todo: ToDo) => Promise<void>;
    deleteToDo: (id: string) => Promise<void>;
    getToDos: () => Promise<ToDo[] | undefined>;
    
}