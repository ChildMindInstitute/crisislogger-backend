import mongoose from 'mongoose'
let Schema = mongoose.Schema
let Model = mongoose.model

const questionnaireSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
    questionnaireData: Object
})

const Questionnaire = Model('Questionnaire', questionnaireSchema)

export default Questionnaire