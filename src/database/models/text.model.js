import mongoose from 'mongoose'
let Schema = mongoose.Schema
let Model = mongoose.model

const textSchema = new Schema({
    text: String,
    share: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    voice: String,
    contribute_to_science: Boolean,
    user_id: String,
    created_at: Date,
    rank: Number,
    hide: { type: Boolean, default: true }
})

const Text = Model('Text', textSchema)

export  default  Text