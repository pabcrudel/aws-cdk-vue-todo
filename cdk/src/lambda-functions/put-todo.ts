import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Request } from "../request";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let statusCode: number;
    let body: { [key: string]: any; };
    let Req: Request = new Request();

    try {
        // Return a successful response
        body = Req.putToDo(event);
        statusCode = 200;
    } 
    catch (error) {
        // Return an error response if there was any issue adding the ToDo item
        statusCode = 500;
        body = { error: error instanceof Error ? error.message : "Unknown error occurred" };
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    };
};
