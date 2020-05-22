import mongoose from 'mongoose'
let Schema = mongoose.Schema
let Model = mongoose.model

const userSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: Number,
    token: String,
})

const User =  Model('User', userSchema)

export default User