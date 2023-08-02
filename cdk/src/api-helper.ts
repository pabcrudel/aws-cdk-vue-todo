export class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ApiError";
    };
};
class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, 400);
    };
};

export class Request {
    public statusCode: number;
    public rawBody: any;
    public readonly headers: { [key: string]: string } = { "content-type": "application/json" };

    public catchError(error: any) {
        this.statusCode = error instanceof ApiError ? error.statusCode : 500;
        this.rawBody = { error: error instanceof Error ? error.message : "Unknown error occurred" };
    };

    public validateUUID(uuid: any) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (uuid === undefined) throw new BadRequestError("The 'id' property is required");
        else if (!uuidRegex.test(uuid)) throw new BadRequestError("The 'id' property must be a valid uuid");
    };

    public validateDate(dateStr: any) {
        if (dateStr === undefined) throw new BadRequestError("The 'date' property is required");
        else {
            const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
            if (!isoDateRegex.test(dateStr)) throw new BadRequestError("The 'date' property is not a valid ISO date");
        };
    };

    public validateName(name: any) {
        if (name === undefined) throw new BadRequestError("The 'name' property is required");
        else if (typeof name !== 'string') throw new BadRequestError("The 'name' property must be a string");
    };
}
