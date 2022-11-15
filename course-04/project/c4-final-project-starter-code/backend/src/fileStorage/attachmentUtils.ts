import * as AWS from 'aws-sdk'
import { Types } from 'aws-sdk/clients/s3'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    
    constructor(
        private readonly s3Client : Types = new XAWS.S3({signatureVersion : 'v4'}),
        private readonly s3Bucket = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ){}

    async generateUploadUrl(todoId:string): Promise<string> {

        const uploadUrl = this.s3Client.getSignedUrl('putObject',{
            Bucket: this.s3Bucket,
            Key: todoId,
            Expires: Number(this.urlExpiration)
        })
        
        return uploadUrl
    }

}