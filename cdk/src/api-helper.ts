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

export function validateUUID(uuid: any) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (uuid === undefined) throw new BadRequestError("The 'id' property is required");
    else if (!uuidRegex.test(uuid)) throw new BadRequestError("The 'id' property must be a valid uuid");
};

export function validateDate(dateStr: any) {
    if (dateStr === undefined) throw new BadRequestError("The 'date' property is required");
    else {
        const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
        if (!isoDateRegex.test(dateStr)) throw new BadRequestError("The 'date' property is not a valid ISO date");
    };
};

export function validateName(name: any) {
    if (name === undefined) throw new BadRequestError("The 'name' property is required");
    else if (typeof name !== 'string') throw new BadRequestError("The 'name' property must be a string");
};

export class Request {
    public static statusCode: number;
    public static rawBody: any;
    public static readonly headers: { [key: string]: string } = { "content-type": "application/json" };

    public static catchError(error: any) {
        this.statusCode = error instanceof ApiError ? error.statusCode : 500;
        this.rawBody = { error: error instanceof Error ? error.message : "Unknown error occurred" };
    };
};
