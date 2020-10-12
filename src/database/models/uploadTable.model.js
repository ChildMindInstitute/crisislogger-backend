import mongoose from 'mongoose'

let Schema = mongoose.Schema
let Model = mongoose.model

const uploadTableSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: String,
    voice: String,
    share: {
        type: Number,
        enum: [0, 1, 2],
        default: 2
    },
    published: {
        type:Boolean,
        default:false
    },
    user_id: String,
    contribute_to_science: Boolean,
    video_id: String,
    created_at: Date,
    video_generated: Boolean,
    converted: Boolean,
    where_from: String,
    audio_generated: Boolean,
    approved:{
        type:Boolean,
        default:false
    },
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
    text:String,
    original_file_name:String,
    recorded_date:Date,
    privacy_update_date:Date,
    transcript_rate:Number,
    sqlId:String,
})
const UploadTable = Model('uploads', uploadTableSchema)

export default UploadTable