import mongoose from 'mongoose'
import encrypt from 'mongoose-encryption'

let Schema = mongoose.Schema
let Model = mongoose.model

const userSchema = new Schema({
    name: String,
    email: { type: String },
    password: String,
    role: Number,
    token: String,
    referral_code: String,
    country : String,
})
userSchema.plugin(encrypt,{ secret: process.env.APP_KEY, encryptedFields: ['name', 'country', 'email'] });
const User =  Model('User', userSchema)
export default User