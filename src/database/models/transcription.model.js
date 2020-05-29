import mongoose from 'mongoose'
let Schema = mongoose.Schema
let Model = mongoose.model

const transcriptionSchema = new Schema({
    upload_id: String,
    user_id: String,
    text: String,
    create_at: Date,
})

const transcriptionModel = Model('Transcription', transcriptionSchema)

export default transcriptionModel