import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class CognitoAuth extends Construct {
    /** Cognito User Pool with Email Sign-in Type */
    readonly userPool: cognito.IUserPool;

    /**A user pool client application that can interact with the user pool. */
    readonly userPoolClient: cognito.IUserPoolClient;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.userPool = new cognito.UserPool(this, 'UserPool', {
            selfSignUpEnabled: true,
            signInAliases: { email: true, username: true },
            keepOriginal: { email: true },
            standardAttributes: {
                fullname: { required: true, mutable: true },
            },
            customAttributes: {
                'joinedOn': new cognito.DateTimeAttribute({ mutable: false }),
                'userID': new cognito.StringAttribute({ mutable: false }),
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

        this.userPoolClient = new cognito.UserPoolClient(this, 'AppClient', {
            userPool: this.userPool,
        });
    };
};