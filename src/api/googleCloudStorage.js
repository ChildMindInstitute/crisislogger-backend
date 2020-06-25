import { Storage } from '@google-cloud/storage'
const bucketName = process.env.BUCKET_NAME
export const storage = new Storage();

async function createBucket() {
    try {
        await storage.createBucket(bucketName);
        console.log(`Bucket ${bucketName} created.`)
    } catch(err) {
        console.log('Create bucket ' + err)
    }
}

export  const uploadFile = async (fileName, uploadFile,  mimeType)  => {
    try {
        await storage.bucket(bucketName).makePublic();
        await  storage.bucket(bucketName).upload(uploadFile);
        return { success: true }
    } catch (err) {
        console.log('Upload File ' + err)
        return { success: false }
    }
}
export const getPublicURL = () =>
{
    return `https://storage.googleapis.com/${bucketName}/`;
}
//createBucket().catch(console.error)