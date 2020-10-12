import mongoose from 'mongoose'
import encrypt from "mongoose-encryption";
let Schema = mongoose.Schema
let Model = mongoose.model

const questionnaireSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
    questionnaireData: Object,
    fields:String,
    sqlId:String
})
questionnaireSchema.plugin(encrypt,{ secret:  process.env.APP_KEY,encryptedFields: ['questionnaireData']  });
const Questionnaire = Model('Questionnaire', questionnaireSchema)

export default Questionnaire