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
    host: String,
    remember_token:String,
    updated_at:String,
    openhumans_access_token:String,
    openhumans_refresh_token:String,
    openhumans_project_member_id:String,
    state:String,
    sqlId:String
})
userSchema.plugin(encrypt,{ secret: process.env.APP_KEY, encryptedFields: ['name', 'country'] });
const User =  Model('User', userSchema)
export default User