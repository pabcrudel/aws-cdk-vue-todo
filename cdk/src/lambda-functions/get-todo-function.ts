import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBStore } from "../dynamodb-store";
import { ToDoDynamoDB } from "../todo-interfaces";

const dbStore: ToDoDynamoDB = new DynamoDBStore();

exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;

    const id = event.pathParameters!.id;
    if (id === undefined)
        response = {
            statusCode: 400,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ message: "Missing 'id' parameter in path" }),
        };
    else {
        try {
            const result = await dbStore.getToDo(id);

            if (result === undefined)
                response = {
                    statusCode: 404,
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ message: "ToDo not found" }),
                };
            else
                response = {
                    statusCode: 200,
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(result),
                };
        }
        catch (error) {
            response = {
                statusCode: 500,
                headers: { "content-type": "application/json" },
                body: JSON.stringify(error),
            };
        };
    };

    return response;
};