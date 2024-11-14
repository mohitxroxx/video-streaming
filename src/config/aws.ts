import { S3Client, GetObjectCommand,PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from 'fs'
import 'dotenv/config'

const client = new S3Client({
    // endpoint: 
    //it is needed for r2 but not for s3
    region: process.env.R2_BUCKET_REGION as string,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY as string,
        secretAccessKey: process.env.R2_SECRET_KEY as string
    },

});

const url=async(key:string)=>{
    const command=new GetObjectCommand({
        Bucket:process.env.R2_BUCKET_NAME as string,
        Key:key
    });
    const url= await getSignedUrl(client,command)
    return url
}

async function url1() {
    const value=await url('hi.txt')
    console.log(value)
} 
// url1()

async function uploadFile(bucketName: string, fileName: string) {
    try {
        const fileContent = fs.readFileSync('./hi.txt');
     
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: fileContent,
            // ContentType:"application/pdf" 
            //by default its octetstream so chnaging it will allow to open online instead of downloading
            /*Like for text file Content-Type='text/plain'
            for image png Content-Type='image/png'
            for jpg,jpeg ContentType:"image/jpeg",
            pdf Content-Type=application/pdf*/
        });
        const response = await client.send(command);
        console.log("File uploaded successfully. Response:", response);
    } catch (error) {
        console.error("File upload failed:", error);
    }
}

// uploadFile(process.env.R2_BUCKET_NAME,'hi.txt')
url1()

export default client;
