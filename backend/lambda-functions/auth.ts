import { CognitoIdentityProviderClient, SignUpCommand, SignUpCommandInput } from '@aws-sdk/client-cognito-identity-provider';
import { RequestFunction } from "./types";
import { ApiErrorResponse, ApiSuccessResponse, BadRequestError } from "./utils";

const cognito = new CognitoIdentityProviderClient({ region: process.env.USER_POOL_REGION });

export const register: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new BadRequestError("Empty request body");
        else {
            const { password, username, email } = JSON.parse(event.body);

            if (validateString(password)) throw new BadRequestError("Empty password");
            if (validateString(username)) throw new BadRequestError("Empty username");
            if (validateString(email)) throw new BadRequestError("Empty email");

            const input: SignUpCommandInput = {
                ClientId: process.env.USER_POOL_CLIENT_ID,
                Password: password,
                Username: username,
                UserAttributes: [{ Name: "email", Value: email }]
            };

            const response = await cognito.send(new SignUpCommand(input));

            return new ApiSuccessResponse(response);
        };
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};
export const login: RequestFunction = async (event) => {
    return new ApiSuccessResponse(event);
};
export const recovery: RequestFunction = async (event) => {
    return new ApiSuccessResponse(event);
};
export const changePassword: RequestFunction = async (event) => {
    return new ApiSuccessResponse(event);
};
export const changeUsername: RequestFunction = async (event) => {
    return new ApiSuccessResponse(event);
};
export const changeEmail: RequestFunction = async (event) => {
    return new ApiSuccessResponse(event);
};

function validateString(string: string) {
    return typeof string !== 'string' || string.length;
};