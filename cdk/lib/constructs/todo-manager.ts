import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class TodoManagerConstruct extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        /** 
         * DynamoDB table for storing ToDo items.
         * 
         * - Partition key: 'name' (String)
         * - Sort key: 'id' (String)
         * - Encryption: AWS-managed
         * - Removal policy: DESTROY (table will be deleted when the stack is deleted)
         */
        const todoTable = new dynamodb.Table(this, 'ToDo', {
            partitionKey: {
                name: 'name',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
    };
};
