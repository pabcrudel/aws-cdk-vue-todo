import { IRestApi } from 'aws-cdk-lib/aws-apigateway';

export interface ApiResourceProps {
    readonly restApi: IRestApi;
}