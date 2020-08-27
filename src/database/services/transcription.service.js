import TranscriptionModel from '../models/transcription.model'

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
}
export default TranscriptionModelService