import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CognitoAuth extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        /** Cognito User Pool with Email Sign-in Type */
        const userPool = new cognito.UserPool(this, 'UserPool', {
            selfSignUpEnabled: true,
            signInAliases: { email: true, username: true, preferredUsername: true },
            keepOriginal: { email: true },
            standardAttributes: {
                fullname: { required: true, mutable: true },
            },
            customAttributes: {
                'joinedOn': new cognito.DateTimeAttribute(),
            },
            passwordPolicy: {
                minLength: 10,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
                tempPasswordValidity: cdk.Duration.days(3),
            },
            mfa: cognito.Mfa.OPTIONAL,
            mfaSecondFactor: { sms: false, otp: true },
            deviceTracking: {
                challengeRequiredOnNewDevice: true,
                deviceOnlyRememberedOnUserPrompt: true
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        /**A user pool client application that can interact with the user pool. */
        const userPoolClient = new cognito.UserPoolClient(this, 'AppClient', {
            userPool: userPool,
        });
    };
};