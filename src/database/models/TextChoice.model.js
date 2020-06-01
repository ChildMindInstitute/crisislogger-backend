import mongoose from 'mongoose'
let Schema = mongoose.Schema
let Model = mongoose.model

let textChoiceSchema = new Schema({
    user_id: String,
    text: String,
})

const TextChoice = Model('TextChoice', textChoiceSchema)

export default TextChoice