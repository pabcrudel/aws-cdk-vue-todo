import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamodbSDK, TodoPutParams } from "../dynamodb-sdk-v1";

const dbSDK: DynamodbSDK = new DynamodbSDK();

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let statusCode: number = 400;
    let body: string;

    try {
        // Check if the required body is empty
        if (event.body === null) throw new Error("Empty request body");

        // Parse the request body to extract the ToDo item
        const requestBody = JSON.parse(event.body);
        const { id, date, name } = requestBody;

        // Check if the required fields are present in the request body and are valid
        if (id === undefined) throw new Error("The 'id' property is required in the request body");
        if (!isUUID(id)) throw new Error("The 'id' property must be a valid uuid");
        if (date === undefined) throw new Error("The 'date' property is required in the request body");
        if (!isDate(date)) throw new Error("The 'date' property is not valid");
        if (name === undefined) throw new Error("The 'name' property is required in the request body");

        // Call the putToDo method of DynamodbSDK to add the new ToDo item to the table
        const todo: TodoPutParams = {
            id: id,
            date: date,
            name: name
        };
        await dbSDK.setToDo(todo);

        // Return a successful response
        statusCode = 200;
        body = JSON.stringify({ message: "ToDo created" });
    }
    catch (error) {
        // Return an error response if there was any issue adding the ToDo item
        body = JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" });
    };

    return {
        statusCode,
        headers: { "content-type": "application/json" },
        body,
    };
};

function isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

function isDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
};