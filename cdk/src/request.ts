import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters } from "aws-lambda";
import { DynamodbSDK } from "./dynamodb-sdk";
import { randomUUID } from "crypto";

export class Request {
    private dbSDK = new DynamodbSDK();

    // Request Methods
    public async getAllToDos(): Promise<{ [key: string]: any }[]> {
        return await this.dbSDK.getAllToDos();
    };
    public async getToDo(event: APIGatewayProxyEvent): Promise<{ [key: string]: any; }> {
        this.validateParameters(event.queryStringParameters);

        const {id, date} = event.queryStringParameters!;

        this.validateUUID(id);
        this.validateDate(date);

        return await this.dbSDK.getTodo({id: id!, date: new Date(date!)});
    };
    public async postToDo(event: APIGatewayProxyEvent): Promise<{ [key: string]: any; }>  {
        this.validateBody(event.body);

        const requestBody = JSON.parse(event.body!);

        this.validateName(requestBody.name);

        await this.dbSDK.setToDo({id: randomUUID(), date: new Date(), name: requestBody.name});
        return { message: "ToDo created" };
    };
    public async putToDo(event: APIGatewayProxyEvent): Promise<{ [key: string]: any; }>  {
        this.validateBody(event.body);

        const requestBody = JSON.parse(event.body!);
        const { id, date, name } = requestBody;

        this.validateUUID(id);
        this.validateDate(date);
        this.validateName(name);

        await this.dbSDK.setToDo({ id, date, name });
        return { message: "ToDo saved" };
    };
    public async deleteToDo(event: APIGatewayProxyEvent): Promise<{ [key: string]: any; }>  {
        this.validateBody(event.body);

        const requestBody = JSON.parse(event.body!);
        const { id, date } = requestBody;

        this.validateUUID(id);
        this.validateDate(date);

        await this.dbSDK.deleteToDo({id, date: new Date(date)});
        return { message: "ToDo deleted" };
    };

    // Validating Methods
    private validateParameters(parameters: null | APIGatewayProxyEventQueryStringParameters) {
        if (parameters === null) throw new Error("Empty request parameters");
    };
    private validateBody(body: null | string) {
        if (body === null) throw new Error("Empty request body");
    };
    private validateUUID(uuid: undefined | string) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (uuid === undefined) throw new Error("The 'id' property is required in the request body");
        else if (!uuidRegex.test(uuid)) throw new Error("The 'id' property must be a valid uuid");
    };
    private validateDate(dateStr: undefined | string) {
        if (dateStr === undefined) throw new Error("The 'date' property is required in the request body");
        else {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) throw new Error("The 'date' property is not valid");
        };
    };
    private validateName(name: undefined | string) {
        if (name === undefined) throw new Error("The 'name' property is required in the request body");
    };
};