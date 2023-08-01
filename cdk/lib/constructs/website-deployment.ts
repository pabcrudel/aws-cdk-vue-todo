import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class WebsiteDeploymentConstruct extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        /** The s3 bucket where the website will be hosted */
        const s3HostingBucket = new s3.Bucket(this, 'S3HostingBucket', {
            publicReadAccess: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            accessControl: s3.BucketAccessControl.PRIVATE,
            objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
            encryption: s3.BucketEncryption.S3_MANAGED,
        });

        /** CloudFront Origin Access Identity (OAI) user */
        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
            this, 'CloudFrontOriginAccessIdentity'
        );

        // Add the OAI user with read permissions for the objects in the S3 bucket
        s3HostingBucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [s3HostingBucket.arnForObjects('*')],
            principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
        }));

        /**
        * Creates a Cloudfront Response Headers Policy which applies security headers to enhance security.
        * The security headers behavior includes the following:
        * 
        * - Content Security Policy
        * - Strict Transport Security
        * - X-Content-Type-Options
        * - Referrer Policy
        * - XSS Protection
        * - Frame Options
        */
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
                origin: new origins.S3Origin(s3HostingBucket, {
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
                    responseHttpStatus: 404,
                    responsePagePath: "/index.html"
                }
            ]
        });

        /** Deploying the built files from the frontend to the s3 hosting the website */
        new s3deploy.BucketDeployment(this, 'S3HostingBucketDeployment', {
            sources: [s3deploy.Source.asset('../frontend/dist'),],
            prune: false,
            destinationBucket: s3HostingBucket,
            distribution: cloudfrontDistribution,
        });

        // Displays Website domain name on CloudFormation output
        new cdk.CfnOutput(this, 'CloudFrontDomainName', {
            value: cloudfrontDistribution.distributionDomainName,
            description: 'Domain name of the CloudFront distribution',
            exportName: "WebsiteDomainName"
        });
    };
};