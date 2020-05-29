import { Storage } from '@google-cloud/storage'

const bucketName = process.env.BUCKET_NAME
export const storage = new Storage();

async function createBucket() {
    await storage.createBucket(bucketName);
    console.log(`Bucket ${bucketName} created.`)
}

export async function uploadFile(fileName) {
  await storage.bucket(bucketName).upload(fileName, {
    gzip: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    }
  })

  console.log(`${fileName} uploaded to ${bucketName}`)
}

createBucket().catch(console.error)