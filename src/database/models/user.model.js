import mongoose from 'mongoose'
let Schema = mongoose.Schema
let Model = mongoose.model

const userSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: Number,
    token: String,
    referral_code: String,
    country : String,
    uploads: [{
        type: mongoose.Schema.Types.ObjectId, ref:'Uploads'
    }],
    texts: [{
        type: mongoose.Schema.Types.ObjectId, ref:'Text'
    }],
})

const User =  Model('User', userSchema)

export default User