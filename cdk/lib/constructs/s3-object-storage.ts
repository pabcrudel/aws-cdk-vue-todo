import * as iam from 'aws-cdk-lib/aws-iam'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cr from 'aws-cdk-lib/custom-resources'
import { Construct } from 'constructs'


export interface S3ObjectStorageProps {
    /** The bucket where object should be uploaded */
    bucket: s3.IBucket
    /** Key to upload to object */
    key: string
    /** The object to be uploaded */
    object: Record<string, string>
}

/** This construct allow to upload a JSON object to given S3 bucket. */
export class S3Object extends Construct {
    constructor(scope: Construct, id: string, props: S3ObjectStorageProps) {
        super(scope, id)
    }
}