import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";


export const sesClient = new SESClient({
    region:  process.env.AWS_REGION,
   credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,   // iam user
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, //i am user
      }
    : undefined,
})