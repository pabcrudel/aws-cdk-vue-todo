import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export class WebsiteResourceBuildingConstruct extends Construct {
    s3HostingBucket: cdk.aws_s3.Bucket;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        /** The s3 bucket where the website will be hosted */
        this.s3HostingBucket = new s3.Bucket(this, 'S3HostingBucket', {
            publicReadAccess: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            accessControl: s3.BucketAccessControl.PRIVATE,
            objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
            encryption: s3.BucketEncryption.S3_MANAGED,
        });

        // Displays Bucket name on CloudFormation output
        new cdk.CfnOutput(this, 'S3BucketName', {
            value: this.s3HostingBucket.bucketName,
            description: 'Bucket name of the s3 hosting bucket',
            exportName: "S3BucketName"
        });

        /** CloudFront Origin Access Identity (OAI) user */
        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
            this, 'CloudFrontOriginAccessIdentity'
        );

        // Add the OAI user with read permissions for the objects in the S3 bucket
        this.s3HostingBucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [this.s3HostingBucket.arnForObjects('*')],
            principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
        }));

        /** Creates a Cloudfront Response Headers Policy which applies security headers to enhance security. */
        const responseHeaderPolicy = new cloudfront.ResponseHeadersPolicy(this, 'CloudFrontResponseHeaderPolicy', {
            comment: 'Security headers response header policy',
            securityHeadersBehavior: {
                contentSecurityPolicy: {
                    override: true,
                    contentSecurityPolicy: "default-src https:;"
                },
                strictTransportSecurity: {
                    override: true,
                    accessControlMaxAge: cdk.Duration.days(2 * 365),
                    includeSubdomains: true,
                    preload: true
                },
                contentTypeOptions: {
                    override: true
                },
                referrerPolicy: {
                    override: true,
                    referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN
                },
                xssProtection: {
                    override: true,
                    protection: true,
                    modeBlock: true
                },
                frameOptions: {
                    override: true,
                    frameOption: cloudfront.HeadersFrameOption.DENY
                }
            }
        });

        /** Binding S3 bucket, OAI user and Response Headers Policy to the Cloudfront distribution */
        const cloudfrontDistribution = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
            defaultRootObject: 'index.html',
            minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            defaultBehavior: {
                origin: new origins.S3Origin(this.s3HostingBucket, {
                    originAccessIdentity: cloudfrontOAI
                }),
                compress: true,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                responseHeadersPolicy: responseHeaderPolicy
            },
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: "/index.html"
                }
            ]
        });

        /** Custom Resource that is responsible for invalidating the cache of the CloudFront distribution. */
        const cloudFrontAwsResource = new cr.AwsCustomResource(this, "CloudFrontInvalidation", {
            onCreate: {
                physicalResourceId: cr.PhysicalResourceId.of(`${cloudfrontDistribution.distributionId}-${Date.now()}`),
                service: "CloudFront",
                action: "createInvalidation",
                parameters: {
                    DistributionId: cloudfrontDistribution.distributionId,
                    InvalidationBatch: {
                        CallerReference: Date.now().toString(),
                        Paths: {
                            Quantity: 1,
                            Items: ['/*']
                        }
                    }
                },
            },
            policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
                resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
            }),
        });
        cloudFrontAwsResource.node.addDependency(cloudfrontDistribution);

        // Displays Website domain name on CloudFormation output
        new cdk.CfnOutput(this, 'CloudFrontDomainName', {
            value: cloudfrontDistribution.distributionDomainName,
            description: 'Domain name of the CloudFront distribution',
            exportName: "WebsiteDomainName"
        });
    };
};