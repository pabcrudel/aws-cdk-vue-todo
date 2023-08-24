import { IRestApi } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { IUserPool, IUserPoolClient } from 'aws-cdk-lib/aws-cognito';

export interface ApiResourceProps {
    readonly restApi: IRestApi;
    readonly userPool: IUserPool;
    readonly userPoolClient: IUserPoolClient;
}

export interface CRUDResourceProps extends ApiResourceProps {
    readonly todoTable: ITable;
}