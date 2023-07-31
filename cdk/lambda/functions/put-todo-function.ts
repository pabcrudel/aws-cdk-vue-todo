import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK } from "../dynamodb-sdk";
import { ToDo, ToDoDynamoDB } from "../todo-interfaces";

const dbStore: ToDoDynamoDB = new DynamodbSDK();

exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let statusCode: number;
    let body: string;

    const id = event.pathParameters!.id;
    if (id !== undefined && event.body !== null) {
        let todo: ToDo;
        try {
            todo = JSON.parse(event.body);

            if (!(todo instanceof Object)) throw Error("Parsed ToDo is not an object");
            else if (id !== todo.id) throw Error("ToDo ID in path does not match ToDo ID in body");
            else {
                await dbStore.putToDo(todo);
                statusCode = 201;
                body = JSON.stringify({ message: "ToDo created" });
            };
        } catch (error) {
            statusCode = 400;
            body = JSON.stringify(error);
        };
    }
    else {
        statusCode = 400;

        let responseMsg: string = "";
        if (id === undefined) responseMsg = "Missing 'id' parameter in path";
        if (event.body === null) {
            if (responseMsg.length > 0) {
                responseMsg += "\n"
            }
            responseMsg += "Empty request body";
        };
        body = responseMsg;
    }

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body
    };
};