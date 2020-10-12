import mongoose from 'mongoose'
import encrypt from "mongoose-encryption";
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
    user_id:  { type: Schema.Types.ObjectId, ref: 'User' },
    created_at: Date,
    rank: Number,
    where_from: String,
    approved:{
        type:Boolean,
        default:false
    },
    hide: { type: Boolean, default: true },
    sqlId:String,
    privacy_updated_date:String,
})
textSchema.plugin(encrypt,{ secret:  process.env.APP_KEY, encryptedFields: ['text'] });
const Text = Model('Text', textSchema)

export  default  Text