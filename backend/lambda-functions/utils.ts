const responseCors = {
    "content-type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*"
};

export const authResponseCors = {
    ...responseCors,
    "Access-Control-Allow-Methods": "POST"
};

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