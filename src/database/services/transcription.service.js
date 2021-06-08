import TranscriptionModel from '../models/transcription.model'
import Text from "../models/text.model";

class TranscriptionModelService {
    createTable(createObj) {
        const obj = new TranscriptionModel(createObj)
        return obj.save()
    }
    async findModel(_id)
    {
        return  await TranscriptionModel.find({_id: _id});
    }
    async updateTranscriptionTable(id, obj)
    {
        await TranscriptionModel.updateOne({_id: id}, obj);
    }
    async findTextUploadWithText(text){
        let list=[]
        let res  = await TranscriptionModel.find()
        return res.filter(el=>el.text.includes(text))
    }
}
export default TranscriptionModelService