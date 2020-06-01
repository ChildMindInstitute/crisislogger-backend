import { Storage } from '@google-cloud/storage'
import {file} from "googleapis/build/src/apis/file";
import fs from 'fs'

const bucketName = process.env.BUCKET_NAME
export const storage = new Storage();
async function createBucket() {
    await storage.createBucket(bucketName);
    console.log(`Bucket ${bucketName} created.`)
}

export  const uploadFile = async (fileName, uploadFile,  mimeType)  => {
    await storage.bucket(bucketName).makePublic();
    const status = await  storage.bucket(bucketName).upload(uploadFile);
    if (status.id !== undefined)
    {
        return {success: false}
    }
    else {
        return {success: true}
    }
}
export const getPublicURL = () =>
{
    return `https://storage.googleapis.com/${bucketName}/`;
}
createBucket().catch(console.error)