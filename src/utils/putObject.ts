import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "./s3Credentials";
import mime from 'mime-types';
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export const getSignedUrlS3 = async (fileName: string, bucketName: string) => {
    try {
        const client = new S3Client({ region: process.env.AWS_REGION })
        const command = new GetObjectCommand({ Bucket: bucketName, Key: fileName });
        return await getSignedUrl(client, command, { expiresIn: 1 * 60 * 60 });
    } catch (error) {
        console.error(error)
        return ""
    }
}


export const putObject = async(file,fileName) =>{
    try{
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `${fileName}`,
            Body: file,
            // ContentType: "image/jpg,jpeg,png",
            ContentType: mime.lookup(fileName) || 'application/octet-stream', 
            // ContentType: "application/pdf,docx,xlsx", 
        }

        // const command = new PutObjectCommand(params);
        // const data = await s3Client.send(command);

        // if(data.$metadata.httpStatusCode !== 200){
        //     return;
        // }
        // let url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`
        // console.log(url);
        // return {url,key:params.Key};





        const parallelUploads3 = new Upload({
            client: s3Client,
            params:params,
                
            queueSize: 2,
            partSize: 1024 * 1024 * 5,
            leavePartsOnError: false,
          });
        
          const startTime = Date.now();

          parallelUploads3.on("httpUploadProgress", (progress) => {
              const percentage = ((progress.loaded / progress.total) * 100).toFixed(2);
              console.log(`Upload progress: ${percentage}%`);
          });
  
          await parallelUploads3.done();
  
          
          const endTime = Date.now(); 
  
          const timeTaken = ((endTime - startTime) / 1000).toFixed(2);
          console.log(`Upload complete! Total time taken: ${timeTaken} seconds`);

          const url = await getSignedUrlS3(fileName, process.env.AWS_S3_BUCKET)
          return { url, key: params.Key };
    }catch(err){
        console.error(err);
    }
}