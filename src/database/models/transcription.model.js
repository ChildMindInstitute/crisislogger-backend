import mongoose from 'mongoose'
import encrypt from "mongoose-encryption";
let Schema = mongoose.Schema
let Model = mongoose.model

const TranscriptionSchema = new Schema({
    upload_id: String,
    user_id: String,
    text: String,
    create_at: Date,
})

TranscriptionSchema.plugin(encrypt,{ secret:  process.env.APP_KEY, encryptedFields: ['text'] });
const TranscriptionModel = Model('Transcription', TranscriptionSchema)

export default TranscriptionModel