import { APIGatewayProxyResult } from "aws-lambda";

export class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ApiError";
    };
};
export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, 400);
    };
};
export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(message, 404);
    };
};

export class ApiResponse implements APIGatewayProxyResult {
    readonly statusCode: number;
    readonly headers = {
        "content-type": "application/json",
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    };
    readonly body: string;

    constructor(statusCode: number, rawBody: any) {
        this.statusCode = statusCode;
        this.body = JSON.stringify(rawBody);
    };
};
export class ApiSuccessResponse extends ApiResponse {
    constructor(rawBody: any) {
        super(200, rawBody);
    };
};
export class ApiErrorResponse extends ApiResponse {
    constructor(error: any) {
        super(
            error instanceof ApiError ? error.statusCode : 500,
            { error: error instanceof Error ? error.message : "Unknown error occurred" },
        );
    };
};