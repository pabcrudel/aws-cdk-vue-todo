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

    public validateUUID(uuid: any) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (uuid === undefined) throw new BadRequestError("The 'id' property is required as a Query Parameters");
        else if (!uuidRegex.test(uuid)) throw new BadRequestError("The 'id' property must be a valid uuid");
    };

    public validateDate(dateStr: any) {
        if (dateStr === undefined) throw new BadRequestError("The 'date' property is required as a Query Parameters");
        else {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) throw new BadRequestError("The 'date' property is not valid");
        } 
    };
}
