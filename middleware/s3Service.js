import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

export const s3Uploadv2 = async (file) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
  });
  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file.originalname,
    Body: file.buffer,
  };
  const result = await s3.upload(param).promise();
  return result;
};
