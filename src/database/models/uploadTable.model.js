import mongoose from 'mongoose'
let Schema = mongoose.Schema
let Model = mongoose.model

const uploadTableSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: String,
    voice: String,
    share: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    contribute_to_science: Boolean,
    video_id: String,
    create_at: Date,
    video_generated: Boolean,
    converted: Boolean,
    audio_generated: Boolean,
    status: {
        type: String,
        enum: ["finished", "draft", "processing", "failed"],
        default: "draft"
    },
    rank: Number,
    original_name: String,
    hide: { type: Boolean, default: true },
    transcripts: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Transcription'
    },
})

const UploadTable = Model('uploads', uploadTableSchema)

export default UploadTable