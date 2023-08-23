import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log(event)
        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: 'Hello world!', event }),
        };
        return response;
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'An error occurred' }),
        };
    };
};