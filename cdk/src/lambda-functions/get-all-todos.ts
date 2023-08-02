import { APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK } from "../dynamodb-sdk";
import { NotFoundError, Request } from '../api-helper';

const dbSDK: DynamodbSDK = new DynamodbSDK();
const req: Request = new Request();

export async function handler(): Promise<APIGatewayProxyResult> {
    let statusCode: number;
    let body: string;

    try {
        // Parse the request body to extract all the ToDos
        const result = await dbSDK.getAllToDos();

        if (result.Items === undefined || result.Items.length === 0) throw new NotFoundError("ToDo table is empty");

        // Return a successful response
        statusCode = 200;
        body = JSON.stringify({ items: dbSDK.parseItems(result.Items) });
    }
    catch (error) {
        req.catchError(error);
        statusCode = req.statusCode;
        body = JSON.stringify(req.rawBody);
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body
    };
};