import mongoose from 'mongoose'
let Schema = mongoose.Schema
let Model = mongoose.model

const TranscriptionSchema = new Schema({
    upload_id: String,
    user_id: String,
    text: String,
    create_at: Date,
})

const TranscriptionModel = Model('Transcription', TranscriptionSchema)

export default TranscriptionModel