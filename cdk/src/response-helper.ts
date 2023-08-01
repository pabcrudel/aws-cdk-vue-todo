// response-helper.ts
import { APIGatewayProxyResult } from "aws-lambda";

export class ResponseHelper {
    static success(data: any): APIGatewayProxyResult {
        return {
            statusCode: 200,
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data),
        };
    };

    static error(error: unknown, statusCode = 500): APIGatewayProxyResult {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            statusCode,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ error: errorMessage }),
        };
    };
};
