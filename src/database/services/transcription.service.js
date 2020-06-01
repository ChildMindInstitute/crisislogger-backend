import TranscriptionModel from '../models/transcription.model'
import UploadTable from "../models/uploadTable.model";

class TranscriptionModelService {
    createTable(createObj) {
        const obj = new TranscriptionModel(createObj)
        return obj.save()
    }
    async updateTranscriptionTable(id, obj)
    {
        await TranscriptionModel.updateOne({_id: id}, obj, {upsert: true});
    }
}

export default TranscriptionModelService