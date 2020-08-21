import TranscriptionModel from '../models/transcription.model'
import {encrypt, decrypt} from '../../api/Encrypter';
class TranscriptionModelService {
    createTable(createObj) {
        createObj.text = encrypt(createObj.text);
        const obj = new TranscriptionModel(createObj)
        return obj.save()
    }
    async findModel(_id)
    {
        let transcript =  await TranscriptionModel.find({_id: _id});
        if (transcript)
        {
            transcript.text = decrypt(transcript.text);
        }
        return  transcript;
    }
    async updateTranscriptionTable(id, obj)
    {
        await TranscriptionModel.updateOne({_id: id}, obj, {upsert: true});
    }
}
export default TranscriptionModelService