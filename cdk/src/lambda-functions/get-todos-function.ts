import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBStore } from "../dynamodb-store";
import { ToDoDynamoDB } from "../todo-interfaces";

const dbStore: ToDoDynamoDB = new DynamoDBStore();

exports.handler = async (): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;

    try {
        const result = await dbStore.getToDos();
        
        response = {
            statusCode: 200,
            headers: { "content-type": "application/json" },
            body: `{"ToDos": ${JSON.stringify(result)}}`,
        };
    }
    catch (error) {
        response = {
            statusCode: 500,
            headers: { "content-type": "application/json" },
            body: JSON.stringify(error),
        };
    }

    return response;
};