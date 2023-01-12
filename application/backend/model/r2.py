import boto3
from botocore.client import Config
from dotenv import load_dotenv
import os
load_dotenv()


class r2:
    def __init__(self):
        self.s3 = boto3.client(
            "s3",
            endpoint_url="https://" +
            os.getenv("R2_id")+".r2.cloudflarestorage.com",
            aws_access_key_id=os.getenv("R2_access_key_id"),
            aws_secret_access_key=os.getenv("R2_secret_access_key"),
            config=Config(signature_version='s3v4')
        )

    def get_put_url(self, file_name):
        self.s3.put_bucket_cors(Bucket="the-chat",
                                CORSConfiguration=cors_configuration)
        response = self.s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": "the-chat",
                "Key": file_name,
            },
            ExpiresIn=60
        )
        return {"url": response}


cors_configuration = {
    'CORSRules': [{
        'AllowedHeaders': ['Authorization'],
        'AllowedMethods': ['GET', 'PUT'],
        'AllowedOrigins': ['*'],
        'ExposeHeaders': ['ETag', 'x-amz-request-id'],
        'MaxAgeSeconds': 3000
    }]
}
