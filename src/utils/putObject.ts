import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3Credentials";

export const putObject = async(file,fileName) =>{
    try{
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `${fileName}`,
            Body: file,
            // ContentType: "image/jpg,jpeg,png",
            ContentType: "video/mp4,mkv", //For Video
            // ContentType: "application/pdf,docx,xlsx", //For File
            
        }
        const command = new PutObjectCommand(params);
        const data = await s3Client.send(command);

        if(data.$metadata.httpStatusCode !== 200){
            return;
        }
        let url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`
        console.log(url);
        return {url,key:params.Key};
    }catch(err){
        console.error(err);
    }
}