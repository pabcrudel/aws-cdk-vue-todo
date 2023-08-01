// request-validator.ts
export class RequestValidator {
    static validateUUID(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    };

    static validateDate(dateStr: string): boolean {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    };
};
