import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBStore } from "../dynamodb-store";
import { ToDoDynamoDB } from "../todo-interfaces";

const dbStore: ToDoDynamoDB = new DynamoDBStore();

exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let statusCode: number;
    let body: string;

    const id = event.pathParameters!.id;
    if (id === undefined) {
        statusCode = 400;
        body = JSON.stringify({ message: "Missing 'id' parameter in path" });
    }
    else {
        try {
            const result = await dbStore.getToDo(id);

            if (result === undefined) {
                statusCode = 404;
                body = JSON.stringify({ message: "ToDo not found" });
            }
            else {
                statusCode = 200;
                body = JSON.stringify(result);
            };
        }
        catch (error) {
            statusCode = 500;
            body = JSON.stringify(error);
        };
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body
    };
};